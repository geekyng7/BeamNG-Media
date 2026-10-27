using System.Text.Json;
using Windows.Media.Control;
using Windows.Storage.Streams;

internal static class Program
{
    private static GlobalSystemMediaTransportControlsSessionManager? manager;
    private static readonly SemaphoreSlim gate = new(1, 1);
    private static string? cachedKey;
    private static string? cachedThumbnail;

    [STAThread]
    private static async Task Main()
    {
        Console.InputEncoding = System.Text.Encoding.UTF8;
        Console.OutputEncoding = new System.Text.UTF8Encoding(false);
        try { manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync(); }
        catch (Exception ex) { Write(new { type="error", message=ex.Message }); }

        var commands = ReadCommands();
        while (!commands.IsCompleted)
        {
            try { await PublishState(); }
            catch (Exception ex) { Write(new { type="error", message=ex.Message }); }
            await Task.Delay(800);
        }
    }

    private static GlobalSystemMediaTransportControlsSession? ChooseSession()
    {
        var sessions = manager?.GetSessions();
        if (sessions is null || sessions.Count == 0) return null;
        return sessions.FirstOrDefault(s => s.GetPlaybackInfo().PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing)
            ?? manager?.GetCurrentSession() ?? sessions[0];
    }

    private static async Task PublishState()
    {
        await gate.WaitAsync();
        try
        {
            var session = ChooseSession();
            if (session is null)
            {
                cachedKey = null; cachedThumbnail = null;
                Write(new { type="state", track="Нет активного плеера", artist="", album="", is_playing=false, thumbnail=(string?)null, session=false, error=(string?)null, position=0L, duration=0L });
                return;
            }

            var props = await session.TryGetMediaPropertiesAsync();
            var key = string.Concat(session.SourceAppUserModelId, "|", props.Title, "|", props.Artist, "|", props.AlbumTitle);
            if (key != cachedKey || cachedThumbnail is null)
            {
                cachedKey = key;
                cachedThumbnail = await ReadThumbnail(props.Thumbnail);
            }

            var timeline = session.GetTimelineProperties();
            var duration = Math.Max(0L, (timeline.EndTime - timeline.StartTime).Ticks / TimeSpan.TicksPerMillisecond);
            var position = Math.Max(0L, (timeline.Position - timeline.StartTime).Ticks / TimeSpan.TicksPerMillisecond);
            if (duration > 0) position = Math.Min(position, duration);
            Write(new { type="state", track=props.Title ?? "", artist=props.Artist ?? "", album=props.AlbumTitle ?? "", is_playing=session.GetPlaybackInfo().PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing, thumbnail=cachedThumbnail, session=true, error=(string?)null, position, duration });
        }
        finally { gate.Release(); }
    }

    private static async Task<string?> ReadThumbnail(IRandomAccessStreamReference? reference)
    {
        if (reference is null) return null;
        try
        {
            using var stream = await reference.OpenReadAsync();
            if (stream.Size == 0 || stream.Size > 4 * 1024 * 1024) return null;
            using var reader = new DataReader(stream.GetInputStreamAt(0));
            await reader.LoadAsync((uint)stream.Size);
            var data = new byte[(int)stream.Size]; reader.ReadBytes(data);
            var mime = DetectMime(data);
            return string.Concat("data:", mime, ";base64,", Convert.ToBase64String(data));
        }
        catch { return null; }
    }

    private static string DetectMime(byte[] data)
    {
        if (data.Length >= 8 && data[0] == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47) return "image/png";
        if (data.Length >= 3 && data[0] == 0xFF && data[1] == 0xD8 && data[2] == 0xFF) return "image/jpeg";
        if (data.Length >= 6 && System.Text.Encoding.ASCII.GetString(data, 0, 3) == "GIF") return "image/gif";
        if (data.Length >= 12 && System.Text.Encoding.ASCII.GetString(data, 0, 4) == "RIFF" && System.Text.Encoding.ASCII.GetString(data, 8, 4) == "WEBP") return "image/webp";
        if (data.Length >= 2 && data[0] == 0x42 && data[1] == 0x4D) return "image/bmp";
        return "image/jpeg";
    }

    private static async Task ReadCommands()
    {
        while (true)
        {
            var line = await Console.In.ReadLineAsync();
            if (line is null) return;
            try
            {
                using var json = JsonDocument.Parse(line);
                var root = json.RootElement;
                var action = root.TryGetProperty("action", out var value) ? value.GetString() : null;
                if (action == "exit") return;
                if (action is not ("pause" or "play" or "toggle" or "next" or "prev"))
                {
                    Write(new { type="commandResult", ok=false, error="Поддерживаются пауза, возобновление и переключение треков." });
                    continue;
                }
                await gate.WaitAsync();
                try
                {
                    var session = ChooseSession();
                    if (session is null) { Write(new { type="commandResult", ok=false, error="Нет активного медиа-сеанса." }); continue; }
                    var ok = action switch
                    {
                        "pause" => await session.TryPauseAsync(),
                        "play" => await session.TryPlayAsync(),
                        "next" => await session.TrySkipNextAsync(),
                        "prev" => await session.TrySkipPreviousAsync(),
                        _ => await session.TryTogglePlayPauseAsync()
                    };
                    Write(new { type="commandResult", ok, action, error=ok ? null : "Плеер не поддержал команду." });
                }
                finally { gate.Release(); }
            }
            catch (Exception ex) { Write(new { type="commandResult", ok=false, error=ex.Message }); }
        }
    }

    private static void Write(object value)
    {
        Console.Out.WriteLine(JsonSerializer.Serialize(value));
        Console.Out.Flush();
    }
}