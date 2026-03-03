(function () {
  'use strict';

  var audioUnlocked = false;
  var ambientMode = null;
  var activePinId = null;
  var isDucked = false;
  var debugOn = false;

  var overlay = document.getElementById('start-overlay');
  var stage = document.getElementById('map-stage');
  var debugLayer = document.getElementById('debug-layer');

  var ambientRiver = document.getElementById('ambient-river');
  var ambientCity = document.getElementById('ambient-city');
  var bagelshopAudio = document.getElementById('bagelshop-audio');
  var pinAudios = {
    pin1: bagelshopAudio,
    pin2: document.getElementById('audio-pin2'),
    pin3: document.getElementById('audio-pin3'),
    pin4: document.getElementById('audio-pin4')
  };

  function fadeTo(audioEl, targetVol, ms, easing) {
    if (!audioEl) return;
    var startVol = audioEl.volume;
    var startTime = performance.now();
    easing = easing || 'linear';
    function step(now) {
      var elapsed = now - startTime;
      var t = Math.min(1, elapsed / ms);
      if (easing === 'ease-in') t = t * t;
      audioEl.volume = startVol + (targetVol - startVol) * t;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function crossfade(toAudio, fromAudio, ms) {
    if (fromAudio) {
      fadeTo(fromAudio, 0, ms);
      setTimeout(function () {
        fromAudio.pause();
        fromAudio.currentTime = 0;
      }, ms);
    }
    if (toAudio) {
      toAudio.currentTime = 0;
      toAudio.play().catch(function () {});
      fadeTo(toAudio, isDucked ? 0.15 : 1, ms);
    }
  }

  function setAmbientMode(mode) {
    if (mode === ambientMode) return;
    ambientMode = mode;
    var vol = isDucked ? 0.15 : 1;
    if (mode === 'river') {
      crossfade(ambientRiver, ambientCity, 300);
    } else if (mode === 'city') {
      crossfade(ambientCity, ambientRiver, 300);
    } else {
      fadeTo(ambientRiver, 0, 300);
      fadeTo(ambientCity, 0, 300);
      setTimeout(function () {
        ambientRiver.pause();
        ambientCity.pause();
        ambientRiver.currentTime = 0;
        ambientCity.currentTime = 0;
      }, 300);
    }
  }

  function stopAllHotspots(exceptId) {
    ['pin1', 'pin2', 'pin3', 'pin4'].forEach(function (id) {
      if (id === exceptId) return;
      var el = pinAudios[id];
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });
    if (!exceptId) {
      activePinId = null;
      setDucking(false);
    }
  }

  function setDucking(duck) {
    if (isDucked === duck) return;
    isDucked = duck;
    var target = duck ? 0.15 : 1;
    var ms = 200;
    if (ambientMode === 'river') fadeTo(ambientRiver, target, ms);
    else if (ambientMode === 'city') fadeTo(ambientCity, target, ms);
  }

  overlay.addEventListener('click', function () {
    if (audioUnlocked) return;
    audioUnlocked = true;
    overlay.classList.add('hidden');
  });

  ['zone-center', 'zone-left', 'zone-right', 'zone-bottom'].forEach(function (zoneId) {
    var el = document.getElementById(zoneId);
    if (!el) return;
    var mode = el.getAttribute('data-ambient');
    el.addEventListener('mouseenter', function () {
      if (!audioUnlocked) return;
      setAmbientMode(mode);
    });
  });

  ['pin2', 'pin3', 'pin4'].forEach(function (pinId) {
    var el = document.getElementById(pinId);
    var audio = pinAudios[pinId];
    if (!el || !audio) return;
    el.addEventListener('mouseenter', function () {
      if (!audioUnlocked) return;
      stopAllHotspots(pinId);
      activePinId = pinId;
      audio.currentTime = 0;
      audio.play().catch(function () {});
      setDucking(true);
    });
    el.addEventListener('mouseleave', function () {
      if (!audioUnlocked) return;
      audio.pause();
      audio.currentTime = 0;
      if (activePinId === pinId) {
        activePinId = null;
        setDucking(false);
      }
    });
  });

  (function () {
    var el = document.getElementById('pin1');
    var audio = bagelshopAudio;
    if (!el || !audio) return;
    el.addEventListener('mouseenter', function () {
      if (!audioUnlocked) return;
      if (activePinId === 'pin1') return;
      stopAllHotspots('pin1');
      activePinId = 'pin1';
      audio.volume = 0;
      audio.currentTime = 0;
      audio.play().catch(function () {});
      fadeTo(audio, 1, 400, 'ease-in');
      setDucking(true);
    });
    el.addEventListener('mouseleave', function () {
      if (!audioUnlocked) return;
      fadeTo(audio, 0, 300);
      setTimeout(function () {
        audio.pause();
        audio.currentTime = 0;
        if (activePinId === 'pin1') {
          activePinId = null;
          setDucking(false);
        }
      }, 300);
    });
  })();

  document.addEventListener('keydown', function (e) {
    if (e.key === 'D' || e.key === 'd') {
      debugOn = !debugOn;
      if (debugOn) {
        stage.classList.add('debug-zones');
        debugLayer.classList.remove('debug-off');
        debugLayer.classList.add('debug-on');
      } else {
        stage.classList.remove('debug-zones');
        debugLayer.classList.add('debug-off');
        debugLayer.classList.remove('debug-on');
      }
    }
  });
})();
