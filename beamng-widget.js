angular.module('beamng.apps')
.directive('mediaWidget', [function () {
  return {
    template:
      '<style>' +

      '.cp{' +
      'position:relative;' +
      'background:rgba(5,6,8,.42);' +
      'backdrop-filter:blur(26px) saturate(175%);' +
      '-webkit-backdrop-filter:blur(26px) saturate(175%);' +
      'border:1px solid rgba(255,255,255,.13);' +
      'border-radius:22px;' +
      'padding:10px;' +
      'color:#fff;' +
      'font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",sans-serif;' +
      'display:flex;' +
      'flex-direction:column;' +
      'align-items:center;' +
      'justify-content:flex-start;' +
      'height:100%;' +
      'width:100%;' +
      'box-sizing:border-box;' +
      'overflow:hidden;' +
      'user-select:none;' +
      'box-shadow:0 8px 30px rgba(0,0,0,.27),inset 0 1px 0 rgba(255,255,255,.075);' +
      'transition:background 350ms ease,border-color 350ms ease,box-shadow 350ms ease;' +
      '}' +

      '.cp-bg{' +
      'position:absolute;' +
      'inset:-30%;' +
      'z-index:0;' +
      'pointer-events:none;' +
      'background-size:cover;' +
      'background-position:center;' +
      'filter:blur(38px) saturate(1.7);' +
      'opacity:0;' +
      'transition:opacity 700ms ease;' +
      '}' +
      '.cp-bg.on{' +
      'opacity:.38;' +
      '}' +
      '.cp:before{' +
      'content:"";' +
      'position:absolute;' +
      'inset:0;' +
      'z-index:1;' +
      'pointer-events:none;' +
      'border-radius:inherit;' +
      'background:linear-gradient(135deg,rgba(255,255,255,.055),transparent 42%,rgba(255,255,255,.012));' +
      'transition:opacity 300ms ease;' +
      '}' +

      '.cp.collapsed{' +
      'background:transparent;' +
      'backdrop-filter:none;' +
      '-webkit-backdrop-filter:none;' +
      'border-color:transparent;' +
      'box-shadow:none;' +
      'padding:0;' +
      'overflow:visible;' +
      '}' +

      '.cp.collapsed .cp-bg{' +
      'opacity:0;' +
      '}' +

      '.cp.collapsed:before{' +
      'opacity:0;' +
      '}' +

      '.cp-content{' +
      'position:relative;' +
      'z-index:2;' +
      'width:100%;' +
      'height:100%;' +
      'display:flex;' +
      'flex-direction:column;' +
      'align-items:center;' +
      'justify-content:flex-start;' +
      'opacity:1;' +
      'transform:scale(1);' +
      'transition:opacity 280ms ease,transform 360ms cubic-bezier(.16,1,.3,1);' +
      '}' +

      '.cp.collapsed .cp-content{' +
      'opacity:0;' +
      'pointer-events:none;' +
      'transform:scale(.92);' +
      'visibility:hidden;' +
      '}' +

      '.cp-collapse{' +
      'position:absolute;' +
      'right:7px;' +
      'top:7px;' +
      'z-index:20;' +
      'width:25px;' +
      'height:25px;' +
      'padding:0;' +
      'border:1px solid rgba(255,255,255,.13);' +
      'border-radius:9px;' +
      'background:rgba(255,255,255,.065);' +
      'backdrop-filter:blur(14px);' +
      '-webkit-backdrop-filter:blur(14px);' +
      'color:rgba(255,255,255,.7);' +
      'font-size:13px;' +
      'line-height:1;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'cursor:pointer;' +
      'opacity:.72;' +
      'transition:transform 180ms ease,background 180ms ease,border-color 180ms ease,opacity 180ms ease;' +
      'box-shadow:0 3px 10px rgba(0,0,0,.18);' +
      '}' +

      '.cp-collapse:hover{' +
      'opacity:1;' +
      'background:rgba(255,255,255,.12);' +
      'border-color:rgba(255,255,255,.22);' +
      'transform:scale(1.06);' +
      '}' +

      '.cp-collapse:active{' +
      'transform:scale(.9);' +
      '}' +

      '.cp.collapsed .cp-collapse{' +
      'position:relative;' +
      'right:auto;' +
      'top:auto;' +
      'width:32px;' +
      'height:32px;' +
      'margin:0;' +
      'border-radius:11px;' +
      'background:rgba(10,11,14,.38);' +
      'border-color:rgba(255,255,255,.16);' +
      'backdrop-filter:blur(18px);' +
      '-webkit-backdrop-filter:blur(18px);' +
      'box-shadow:0 5px 18px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.08);' +
      '}' +

      '.cp.collapsed .cp-collapse:hover{' +
      'transform:scale(1.08);' +
      '}' +

      '.cp-art-wrap{' +
      'position:relative;' +
      'width:min(78%,220px);' +
      'aspect-ratio:1;' +
      'margin:3px auto 8px;' +
      'perspective:1400px;' +
      'perspective-origin:50% 50%;' +
      'flex-shrink:0;' +
      '}' +

      '.cp-art-wrap.playing:after{' +
      'content:"";' +
      'position:absolute;' +
      'inset:-5px;' +
      'border-radius:23px;' +
      'border:1px solid rgba(255,255,255,.11);' +
      'pointer-events:none;' +
      'opacity:0;' +
      'animation:cpGlow 2.8s ease-in-out infinite;' +
      '}' +

      '@keyframes cpGlow{' +
      '0%,100%{opacity:.05;transform:scale(1)}' +
      '50%{opacity:.32;transform:scale(1.025)}' +
      '}' +

      '.cp-art-card{' +
      'position:relative;' +
      'width:100%;' +
      'height:100%;' +
      'transform-style:preserve-3d;' +
      'will-change:transform;' +
      'transform:translateZ(0) rotateY(0deg);' +
      'transition:transform 900ms cubic-bezier(.16,1,.3,1);' +
      '}' +

      '.cp-art-card.flip-next{' +
      'transform:translateZ(0) rotateY(-180deg);' +
      '}' +

      '.cp-art-card.flip-prev{' +
      'transform:translateZ(0) rotateY(180deg);' +
      '}' +

      '.cp-art-face{' +
      'position:absolute;' +
      'inset:0;' +
      'border-radius:19px;' +
      'overflow:hidden;' +
      'backface-visibility:hidden;' +
      '-webkit-backface-visibility:hidden;' +
      'background:rgba(255,255,255,.065);' +
      'border:1px solid rgba(255,255,255,.15);' +
      'box-shadow:inset 0 1px 2px rgba(255,255,255,.1),0 9px 24px rgba(0,0,0,.3);' +
      '}' +

      '.cp-art-face:before{' +
      'content:"";' +
      'position:absolute;' +
      'inset:0;' +
      'z-index:3;' +
      'pointer-events:none;' +
      'background:linear-gradient(115deg,rgba(255,255,255,.13),transparent 30%,transparent 70%,rgba(255,255,255,.025));' +
      '}' +

      '.cp-art-face:after{' +
      'content:"";' +
      'position:absolute;' +
      'inset:0;' +
      'z-index:4;' +
      'pointer-events:none;' +
      'background:rgba(0,0,0,0);' +
      'transition:background 900ms cubic-bezier(.16,1,.3,1);' +
      '}' +

      '.cp-art-card.flip-next .cp-art-front:after,' +
      '.cp-art-card.flip-prev .cp-art-front:after{' +
      'background:rgba(0,0,0,.12);' +
      '}' +

      '.cp-art-face img{' +
      'width:100%;' +
      'height:100%;' +
      'object-fit:cover;' +
      'display:block;' +
      'transform:translateZ(0);' +
      '}' +

      '.cp-art-front{' +
      'transform:rotateY(0deg);' +
      '}' +

      '.cp-art-back{' +
      'transform:rotateY(180deg);' +
      '}' +

      '.cp-art-placeholder{' +
      'width:100%;' +
      'height:100%;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'font-size:34px;' +
      'color:rgba(255,255,255,.2);' +
      '}' +

      '.cp-dot{' +
      'position:absolute;' +
      'top:6px;' +
      'right:6px;' +
      'width:6px;' +
      'height:6px;' +
      'border-radius:50%;' +
      'background:rgba(255,255,255,.22);' +
      'border:1px solid rgba(255,255,255,.4);' +
      'transition:all 280ms ease;' +
      'z-index:6;' +
      '}' +

      '.cp-dot.on{' +
      'background:#4ade80;' +
      'border-color:rgba(255,255,255,.7);' +
      'box-shadow:0 0 8px rgba(74,222,128,.8);' +
      '}' +

      '.cp-info{' +
      'position:relative;' +
      'width:90%;' +
      'min-width:0;' +
      'text-align:center;' +
      'display:flex;' +
      'flex-direction:column;' +
      'align-items:center;' +
      'gap:1px;' +
      'margin-bottom:5px;' +
      'transition:opacity 240ms ease,transform 240ms ease;' +
      '}' +

      '.cp-info.changing{' +
      'opacity:0;' +
      'transform:translateY(3px);' +
      '}' +

      '.cp-title{' +
      'width:100%;' +
      'font-size:12px;' +
      'font-weight:600;' +
      'color:rgba(255,255,255,.95);' +
      'white-space:nowrap;' +
      'overflow:hidden;' +
      'text-overflow:ellipsis;' +
      'letter-spacing:-.25px;' +
      '}' +

      '.cp-artist{' +
      'width:100%;' +
      'font-size:9px;' +
      'color:rgba(255,255,255,.55);' +
      'white-space:nowrap;' +
      'overflow:hidden;' +
      'text-overflow:ellipsis;' +
      '}' +

      '.cp-album{' +
      'width:100%;' +
      'font-size:8px;' +
      'color:rgba(255,255,255,.32);' +
      'white-space:nowrap;' +
      'overflow:hidden;' +
      'text-overflow:ellipsis;' +
      '}' +

      '.cp-middle{' +
      'position:relative;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'gap:8px;' +
      'margin:2px 0 7px;' +
      'width:100%;' +
      '}' +

      '.cp-btn{' +
      'background:rgba(255,255,255,.055);' +
      'backdrop-filter:blur(12px);' +
      '-webkit-backdrop-filter:blur(12px);' +
      'border:1px solid rgba(255,255,255,.11);' +
      'color:rgba(255,255,255,.8);' +
      'font-size:11px;' +
      'cursor:pointer;' +
      'padding:0;' +
      'border-radius:10px;' +
      'transition:transform 180ms cubic-bezier(.2,.8,.2,1),background 180ms ease,border-color 180ms ease;' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'width:29px;' +
      'height:29px;' +
      '}' +

      '.cp-btn:hover{' +
      'background:rgba(255,255,255,.1);' +
      'border-color:rgba(255,255,255,.2);' +
      'transform:scale(1.06);' +
      '}' +

      '.cp-btn:active{' +
      'transform:scale(.9);' +
      'background:rgba(255,255,255,.14);' +
      '}' +

      '.cp-play{' +
      'position:relative;' +
      'background:rgba(255,255,255,.9);' +
      'border:1px solid rgba(255,255,255,.75);' +
      'color:#08090b;' +
      'width:37px;' +
      'height:37px;' +
      'display:inline-flex;' +
      'align-items:center;' +
      'justify-content:center;' +
      'border-radius:13px;' +
      'font-size:12px;' +
      'cursor:pointer;' +
      'padding:0;' +
      'font-weight:600;' +
      'box-shadow:0 3px 12px rgba(0,0,0,.25),inset 0 1px 1px rgba(255,255,255,.55);' +
      'transition:transform 220ms cubic-bezier(.2,.9,.2,1),background 180ms ease,box-shadow 220ms ease;' +
      'overflow:hidden;' +
      '}' +

      '.cp-play:before{' +
      'content:"";' +
      'position:absolute;' +
      'inset:0;' +
      'border-radius:inherit;' +
      'background:linear-gradient(135deg,rgba(255,255,255,.5),transparent 55%);' +
      'opacity:.7;' +
      'pointer-events:none;' +
      '}' +

      '.cp-play:hover{' +
      'background:#fff;' +
      'transform:scale(1.07);' +
      'box-shadow:0 6px 18px rgba(0,0,0,.32),0 0 18px rgba(255,255,255,.08),inset 0 1px 1px rgba(255,255,255,.7);' +
      '}' +

      '.cp-play:active{' +
      'transform:scale(.9);' +
      '}' +

      '.cp-play.pulse{' +
      'animation:cpPlayPulse 420ms cubic-bezier(.2,.8,.2,1);' +
      '}' +

      '@keyframes cpPlayPulse{' +
      '0%{transform:scale(1)}' +
      '35%{transform:scale(.86)}' +
      '68%{transform:scale(1.06)}' +
      '100%{transform:scale(1)}' +
      '}' +

      '.cp-play-icon{' +
      'position:relative;' +
      'z-index:2;' +
      'display:block;' +
      'transition:opacity 140ms ease,transform 220ms cubic-bezier(.2,.8,.2,1);' +
      '}' +

      '.cp-play.pulse .cp-play-icon{' +
      'animation:cpIconChange 420ms ease;' +
      '}' +

      '@keyframes cpIconChange{' +
      '0%{opacity:1;transform:scale(1)}' +
      '35%{opacity:0;transform:scale(.55) rotate(-8deg)}' +
      '65%{opacity:0;transform:scale(.55) rotate(8deg)}' +
      '100%{opacity:1;transform:scale(1) rotate(0)}' +
      '}' +

      '.cp-progress{' +
      'position:relative;' +
      'display:flex;' +
      'align-items:center;' +
      'gap:5px;' +
      'width:94%;' +
      'margin-top:1px;' +
      '}' +

      '.cp-time{' +
      'font-size:9px;' +
      'font-weight:500;' +
      'font-variant-numeric:tabular-nums;' +
      'color:rgba(255,255,255,.5);' +
      'min-width:27px;' +
      'text-align:center;' +
      'letter-spacing:-.1px;' +
      '}' +

      '.cp-seek-wrap{' +
      'position:relative;' +
      'display:flex;' +
      'align-items:center;' +
      'flex:1;' +
      'height:12px;' +
      '}' +

      '.cp-seek-track{' +
      'position:absolute;' +
      'left:0;' +
      'right:0;' +
      'height:3px;' +
      'border-radius:3px;' +
      'background:rgba(255,255,255,.12);' +
      'overflow:hidden;' +
      'pointer-events:none;' +
      '}' +

      '.cp-seek-fill{' +
      'position:absolute;' +
      'left:0;' +
      'top:0;' +
      'height:100%;' +
      'width:0%;' +
      'border-radius:inherit;' +
      'background:rgba(255,255,255,.72);' +
      'box-shadow:0 0 7px rgba(255,255,255,.1);' +
      'transition:width 120ms linear;' +
      '}' +

      'input.cp-seek{' +
      'position:relative;' +
      'pointer-events: none;'+
      'opacity:1;'+
      'cursor: default;'+
      'z-index:2;' +
      '-webkit-appearance:none;' +
      'appearance:none;' +
      'width:100%;' +
      'height:12px;' +
      'background:transparent;' +
      'outline:none;' +
      'cursor:pointer;' +
      'border:none;' +
      'margin:0;' +
      '}' +

      'input.cp-seek::-webkit-slider-runnable-track{' +
      'height:3px;' +
      'background:transparent;' +
      'border:none;' +
      '}' +

      'input.cp-seek::-webkit-slider-thumb{' +
      '-webkit-appearance:none;' +
      'appearance:none;' +
      'width:8px;' +
      'height:8px;' +
      'margin-top:-2.5px;' +
      'border-radius:50%;' +
      'background:#fff;' +
      'box-shadow:0 0 5px rgba(255,255,255,.28);' +
      'cursor:pointer;' +
      'transition:transform 150ms ease,box-shadow 150ms ease;' +
      '}' +

      'input.cp-seek::-webkit-slider-thumb:hover{' +
      'transform:scale(1.25);' +
      'box-shadow:0 0 8px rgba(255,255,255,.35);' +
      '}' +

      'input.cp-seek::-moz-range-track{' +
      'height:3px;' +
      'background:transparent;' +
      'border:none;' +
      '}' +

      'input.cp-seek::-moz-range-thumb{' +
      'width:8px;' +
      'height:8px;' +
      'border-radius:50%;' +
      'background:#fff;' +
      'border:none;' +
      'cursor:pointer;' +
      '}' +

      '.cp.compact .cp-art-wrap{' +
      'width:min(68%,130px);' +
      'margin:1px auto 5px;' +
      '}' +

      '.cp.compact .cp-art-face{' +
      'border-radius:14px;' +
      '}' +

      '.cp.compact .cp-title{' +
      'font-size:10px;' +
      '}' +

      '.cp.compact .cp-artist{' +
      'font-size:8px;' +
      '}' +

      '.cp.compact .cp-album{' +
      'display:none;' +
      '}' +

      '.cp.compact .cp-middle{' +
      'margin:2px 0 4px;' +
      'gap:5px;' +
      '}' +

      '.cp.compact .cp-btn{' +
      'width:25px;' +
      'height:25px;' +
      'font-size:9px;' +
      'border-radius:8px;' +
      '}' +

      '.cp.compact .cp-play{' +
      'width:32px;' +
      'height:32px;' +
      'font-size:10px;' +
      'border-radius:10px;' +
      '}' +

      '.cp.compact .cp-time{' +
      'font-size:8px;' +
      'min-width:23px;' +
      '}' +

      '.cp.compact .cp-progress{' +
      'gap:3px;' +
      'width:96%;' +
      '}' +

      '.cp.tiny{' +
      'padding:5px;' +
      'border-radius:13px;' +
      '}' +

      '.cp.tiny .cp-art-wrap{' +
      'width:min(58%,78px);' +
      'margin:0 auto 4px;' +
      '}' +

      '.cp.tiny .cp-art-face{' +
      'border-radius:10px;' +
      '}' +

      '.cp.tiny .cp-info{' +
      'margin-bottom:2px;' +
      '}' +

      '.cp.tiny .cp-title{' +
      'font-size:8px;' +
      '}' +

      '.cp.tiny .cp-artist{' +
      'font-size:7px;' +
      '}' +

      '.cp.tiny .cp-album{' +
      'display:none;' +
      '}' +

      '.cp.tiny .cp-middle{' +
      'margin:1px 0 3px;' +
      'gap:3px;' +
      '}' +

      '.cp.tiny .cp-btn{' +
      'width:21px;' +
      'height:21px;' +
      'font-size:7px;' +
      'border-radius:6px;' +
      '}' +

      '.cp.tiny .cp-play{' +
      'width:27px;' +
      'height:27px;' +
      'font-size:8px;' +
      'border-radius:8px;' +
      '}' +

      '.cp.tiny .cp-progress{' +
      'gap:2px;' +
      'width:100%;' +
      '}' +

      '.cp.tiny .cp-time{' +
      'font-size:6px;' +
      'min-width:18px;' +
      '}' +

      '.cp.wide{' +
      'align-items:stretch;' +
      '}' +

      '.cp.wide .cp-art-wrap{' +
      'width:min(38%,180px);' +
      'margin:4px auto 7px;' +
      '}' +

      '.cp.wide .cp-info{' +
      'width:92%;' +
      '}' +

      '.cp.wide .cp-title{' +
      'font-size:13px;' +
      '}' +

      '.cp.wide .cp-artist{' +
      'font-size:10px;' +
      '}' +

      '.cp.wide .cp-middle{' +
      'margin-top:4px;' +
      '}' +

      '.cp.tall .cp-art-wrap{' +
      'width:min(82%,260px);' +
      '}' +

      '.cp.tall .cp-title{' +
      'font-size:13px;' +
      '}' +

      '.cp.tall .cp-artist{' +
      'font-size:10px;' +
      '}' +

      '.cp.tall .cp-middle{' +
      'margin-top:4px;' +
      'margin-bottom:9px;' +
      '}' +

      '.cp.tall .cp-btn{' +
      'width:31px;' +
      'height:31px;' +
      '}' +

      '.cp.tall .cp-play{' +
      'width:40px;' +
      'height:40px;' +
      '}' +

      '</style>' +

      '<div class="cp" id="cp">' +

      '  <div class="cp-bg" id="bg"></div>' +

      '  <button class="cp-collapse" id="btnCollapse" type="button">⌃</button>' +

      '  <div class="cp-content" id="cpContent">' +

      '    <div class="cp-art-wrap" id="artWrap">' +
      '      <div class="cp-art-card" id="artCard">' +

      '        <div class="cp-art-face cp-art-front">' +
      '          <div class="cp-dot" id="dot"></div>' +
      '          <img id="art" style="display:none">' +
      '          <div class="cp-art-placeholder" id="ph">♪</div>' +
      '        </div>' +

      '        <div class="cp-art-face cp-art-back">' +
      '          <img id="artBack" style="display:none">' +
      '          <div class="cp-art-placeholder" id="phBack">♪</div>' +
      '        </div>' +

      '      </div>' +
      '    </div>' +

      '    <div class="cp-info" id="info">' +
      '      <div class="cp-title" id="trk">No Music</div>' +
      '      <div class="cp-artist" id="anm"></div>' +
      '      <div class="cp-album" id="alb"></div>' +
      '    </div>' +

      '    <div class="cp-middle">' +
      '      <button class="cp-btn" id="btnPrev">⏮</button>' +
      '      <button class="cp-play" id="btnPlay"><span class="cp-play-icon">▶</span></button>' +
      '      <button class="cp-btn" id="btnNext">⏭</button>' +
      '    </div>' +

      '    <div class="cp-progress">' +
      '      <span class="cp-time" id="posT">0:00</span>' +
      '      <div class="cp-seek-wrap">' +
      '        <div class="cp-seek-track">' +
      '          <div class="cp-seek-fill" id="seekFill"></div>' +
      '        </div>' +
      '        <input type="range" class="cp-seek" id="seek" min="0" max="100" value="0" disabled>' +
      '      </div>' +
      '      <span class="cp-time" id="durT">0:00</span>' +
      '    </div>' +

      '  </div>' +
      '</div>',

    link: function (scope, element) {
      var el = element[0];
      var prevRaw = '';
      var seekDragging = false;
      var currentTrack = '';
      var currentThumbnail = '';
      var queuedFlip = null;
      var animationTimer = null;
      var infoTimer = null;
      var resizeTimer = null;
      var animationLocked = false;
      var pendingDirection = 'next';
      var previousPlaying = false;
      var collapsed = false;
      var timelinePosition = 0;
      var timelineDuration = 0;
      var timelineUpdatedAt = Date.now();
      var timelinePlaying = false;

      function $(id) {
        return el.querySelector('#' + id);
      }

      function fmt(ms) {
        var s = Math.floor((ms || 0) / 1000);
        var m = Math.floor(s / 60);

        s = s % 60;

        return m + ':' + (s < 10 ? '0' : '') + s;
      }

      function imageSource(thumbnail) {
        if (!thumbnail) return "";
        return /^data:image\//i.test(thumbnail)
          ? thumbnail
          : "data:image/jpeg;base64," + thumbnail;
      }

      function setAmbient(thumbnail) {
        var bg = $('bg');
        if (!thumbnail) {
          bg.style.backgroundImage = '';
          bg.classList.remove('on');
          return;
        }
        var src = imageSource(thumbnail);
        bg.style.backgroundImage = 'url("' + src + '")';
        bg.classList.add('on');
      }
      function setImage(img, placeholder, thumbnail) {
        img.onerror = function () {
          img.removeAttribute('src');
          img.style.display = 'none';
          placeholder.style.display = 'flex';
        };
        if (thumbnail) {
          img.src = imageSource(thumbnail);
          img.style.display = 'block';
          placeholder.style.display = 'none';
        } else {
          img.removeAttribute('src');
          img.style.display = 'none';
          placeholder.style.display = 'flex';
        }
      }

      function prepareBack(thumbnail) {
        var back = $('artBack');
        var backPlaceholder = $('phBack');

        back.onerror = function () {
          back.removeAttribute('src');
          back.style.display = 'none';
          backPlaceholder.style.display = 'flex';
        };
        if (thumbnail) {
          back.src = imageSource(thumbnail);
          back.style.display = 'block';
          backPlaceholder.style.display = 'none';
        } else {
          back.removeAttribute('src');
          back.style.display = 'none';
          backPlaceholder.style.display = 'flex';
        }
      }

      function finishFlip(thumbnail) {
        var card = $('artCard');

        setImage(
          $('art'),
          $('ph'),
          thumbnail
        );

        card.style.transition = 'none';
        card.classList.remove('flip-next');
        card.classList.remove('flip-prev');

        void card.offsetWidth;

        card.style.transition = '';

        animationLocked = false;
        currentThumbnail = thumbnail || '';
      }

      function flipTo(thumbnail) {
        var card = $('artCard');

        prepareBack(thumbnail);
        setAmbient(thumbnail);

        card.classList.remove('flip-next');
        card.classList.remove('flip-prev');

        void card.offsetWidth;

        card.classList.add(
          pendingDirection === 'prev'
            ? 'flip-prev'
            : 'flip-next'
        );

        clearTimeout(animationTimer);

        animationTimer = setTimeout(function () {
          finishFlip(thumbnail);
          if (queuedFlip) {
            var queued = queuedFlip;
            queuedFlip = null;
            pendingDirection = queued.direction;
            animationLocked = true;
            flipTo(queued.thumbnail);
          }
        }, 900);
      }

      function animateInfo() {
        var info = $('info');

        clearTimeout(infoTimer);

        info.classList.add('changing');

        infoTimer = setTimeout(function () {
          info.classList.remove('changing');
        }, 120);
      }

      function animatePlay() {
        var button = $('btnPlay');

        button.classList.remove('pulse');

        void button.offsetWidth;

        button.classList.add('pulse');

        setTimeout(function () {
          button.classList.remove('pulse');
        }, 430);
      }

      function setCollapsed(value) {
        collapsed = value;

        var cp = $('cp');
        var button = $('btnCollapse');

        cp.classList.toggle('collapsed', collapsed);

        button.textContent = collapsed ? '⌄' : '⌃';
        button.setAttribute(
          'aria-label',
          collapsed ? 'Развернуть плеер' : 'Свернуть плеер'
        );
      }

      function applyResponsive(width, height) {
        var cp = $('cp');

        if (!cp || collapsed) return;

        var ratio = width / Math.max(height, 1);

        cp.classList.remove(
          'tiny',
          'compact',
          'wide',
          'tall'
        );

        if (width < 135 || height < 125) {
          cp.classList.add('tiny');
        } else if (width < 190 || height < 175) {
          cp.classList.add('compact');
        }

        if (ratio > 1.55 && width >= 210) {
          cp.classList.add('wide');
        }

        if (height > width * 1.35 && height >= 260) {
          cp.classList.add('tall');
        }

        var artWrap = $('artWrap');

        if (!artWrap) return;

        var maxByWidth = width * 0.78;
        var maxByHeight = height * 0.52;

        if (cp.classList.contains('wide')) {
          maxByWidth = width * 0.38;
          maxByHeight = height * 0.5;
        }

        if (cp.classList.contains('tiny')) {
          maxByWidth = width * 0.58;
          maxByHeight = height * 0.38;
        }

        if (cp.classList.contains('compact')) {
          maxByWidth = width * 0.68;
          maxByHeight = height * 0.42;
        }

        if (cp.classList.contains('tall')) {
          maxByWidth = width * 0.82;
          maxByHeight = height * 0.58;
        }

        var size = Math.min(
          maxByWidth,
          maxByHeight
        );

        if (size > 50) {
          artWrap.style.width = Math.round(size) + 'px';
        }
      }

      function resize() {
        var rect = el.getBoundingClientRect();

        applyResponsive(
          rect.width,
          rect.height
        );
      }

      function scheduleResize() {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(
          resize,
          30
        );
      }

      function renderTimeline() {
        if (seekDragging) return;
        var elapsed = timelinePlaying && timelineDuration > 0
          ? Math.max(0, Date.now() - timelineUpdatedAt)
          : 0;
        var pos = timelineDuration > 0
          ? Math.min(timelineDuration, timelinePosition + elapsed)
          : timelinePosition;
        $('posT').textContent = fmt(pos);
        $('seek').value = timelineDuration > 0 ? pos : 0;
        $('seek').max = timelineDuration > 0 ? timelineDuration : 1;
        $('seekFill').style.width = timelineDuration > 0
          ? Math.min(100, Math.max(0, (pos / timelineDuration) * 100)) + '%'
          : '0%';
      }

      function ui(d) {
        if (!d) return;

        var nextTrack =
          d.track || 'No Music';

        var nextThumbnail =
          d.thumbnail || '';
        var thumbnailChanged = nextThumbnail !== currentThumbnail;

        var isPlaying =
          !!d.is_playing;

        var trackChanged =
          currentTrack &&
          nextTrack !== currentTrack;

        var playingChanged =
          previousPlaying !== isPlaying;

        if (trackChanged) {
          animateInfo();
        }

        if (playingChanged) {
          animatePlay();
        }

        $('trk').textContent =
          nextTrack;

        $('anm').textContent =
          d.artist || '';

        $('alb').textContent =
          d.album || '';

        $('btnPlay')
          .querySelector('.cp-play-icon')
          .textContent =
          isPlaying ? '⏸' : '▶';

        $('dot').className =
          'cp-dot' +
          (d.session ? ' on' : '');

        $('artWrap').className =
          'cp-art-wrap' +
          (isPlaying ? ' playing' : '');

        timelineDuration = Math.max(0, Number(d.duration) || 0);
        timelinePosition = Math.max(0, Number(d.position) || 0);
        timelineUpdatedAt = Date.now();
        timelinePlaying = isPlaying;
        $('durT').textContent = fmt(timelineDuration);
        renderTimeline();

        if (!currentTrack) {
          setAmbient(nextThumbnail);
          setImage(
            $('art'),
            $('ph'),
            nextThumbnail
          );
          currentThumbnail = nextThumbnail;
        } else if (trackChanged || thumbnailChanged) {
          if (animationLocked) {
            queuedFlip = { thumbnail: nextThumbnail, direction: pendingDirection };
          } else {
            animationLocked = true;
            flipTo(nextThumbnail);
          }
        }

        currentTrack =
          nextTrack;

        previousPlaying =
          isPlaying;

        scheduleResize();
      }

      function ctrl(action, extra) {
        var lua =
          'local h=require("socket.http") ' +
          'h.TIMEOUT=2 ' +
          'h.request("http://127.0.0.1:12345/api/' +
          action +
          (extra || '') +
          '")';

        bngApi.engineLua(lua);
      }

      function poll() {
        bngApi.engineLua(
          'local f=readFile("/media_state.json",8388608) ' +
          'if f then guihooks.trigger("MediaData",f) end'
        );
      }

      scope.$root.$on(
        'MediaData',
        function (_e, raw) {
          if (!raw || raw === prevRaw) {
            return;
          }

          prevRaw = raw;

          try {
            ui(JSON.parse(raw));
          } catch (ex) {}
        }
      );

      $('btnCollapse').onclick =
        function () {
          setCollapsed(!collapsed);
        };

      $('btnPlay').onclick =
        function () {
          ctrl('play');

          setTimeout(
            poll,
            400
          );
        };

      $('btnNext').onclick =
        function () {
          pendingDirection =
            'next';

          ctrl('next');

          setTimeout(
            poll,
            400
          );
        };

      $('btnPrev').onclick =
        function () {
          pendingDirection =
            'prev';

          ctrl('prev');

          setTimeout(
            poll,
            400
          );
        };

      $('seek').addEventListener(
        'mousedown',
        function () {
          seekDragging = true;
        }
      );

      $('seek').addEventListener(
        'touchstart',
        function () {
          seekDragging = true;
        }
      );

      $('seek').addEventListener(
        'input',
        function () {
          var seek =
            $('seek');

          var dur =
            parseInt(
              seek.max
            ) || 0;

          var pos =
            parseInt(
              seek.value
            ) || 0;

          $('posT').textContent =
            fmt(pos);

          $('seekFill').style.width =
            dur > 0
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    (pos / dur) * 100
                  )
                ) + '%'
              : '0%';
        }
      );

      $('seek').addEventListener(
        'change',
        function () {
          seekDragging = false;

          ctrl(
            'seek/',
            $('seek').value
          );

          setTimeout(
            poll,
            400
          );
        }
      );

      var resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(function () {
              scheduleResize();
            })
          : null;

      if (resizeObserver) {
        resizeObserver.observe(el);
      }

      setCollapsed(false);

      poll();

      resize();

      scope._mwT =
        setInterval(
          poll,
          800
        );

      scope._mwTimeline = setInterval(renderTimeline, 200);

      scope.$on(
        '$destroy',
        function () {
          clearInterval(
            scope._mwT
          );
          clearInterval(scope._mwTimeline);

          clearTimeout(
            animationTimer
          );

          clearTimeout(
            infoTimer
          );

          clearTimeout(
            resizeTimer
          );

          if (resizeObserver) {
            resizeObserver.disconnect();
          }
        }
      );
    }
  };
}]);


