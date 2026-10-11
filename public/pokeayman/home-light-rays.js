/*
 * React Bits Light Rays shader port for the home screen.
 * Keeps the original two-ray field, angle falloff, flicker, noise, fade,
 * saturation, and subtle pointer influence, rendered without an added library.
 */
(() => {
  const screen = document.getElementById('home-screen');
  const mount = screen?.querySelector('.home-light-rays');
  if (!screen || !mount) return;

  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    precision highp float;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec2 rayPos;
    uniform vec2 rayDir;
    uniform vec2 mousePos;
    uniform vec3 raysColor;
    uniform float raysSpeed;
    uniform float lightSpread;
    uniform float rayLength;
    uniform float pulsating;
    uniform float fadeDistance;
    uniform float saturation;
    uniform float mouseInfluence;
    uniform float noiseAmount;
    uniform float distortion;

    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float rayStrength(vec2 source, vec2 direction, vec2 coord,
      float seedA, float seedB, float speed) {
      vec2 sourceToCoord = coord - source;
      vec2 directionToCoord = normalize(sourceToCoord);
      float cosAngle = dot(directionToCoord, direction);
      float distortedAngle = cosAngle + distortion *
        sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
      float spread = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
      float distanceFromSource = length(sourceToCoord);
      float maxDistance = max(iResolution.x * rayLength, 1.0);
      float lengthFalloff = clamp((maxDistance - distanceFromSource) / maxDistance, 0.0, 1.0);
      float fadeRange = max(iResolution.x * fadeDistance, 1.0);
      float fadeFalloff = clamp((fadeRange - distanceFromSource) / fadeRange, 0.5, 1.0);
      float pulse = pulsating > 0.5 ? 0.8 + 0.2 * sin(iTime * speed * 3.0) : 1.0;
      float flicker = clamp(
        (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
        (0.30 + 0.20 * cos(-distortedAngle * seedB + iTime * speed)),
        0.0, 1.0);
      return flicker * lengthFalloff * fadeFalloff * spread * pulse;
    }

    void main() {
      vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
      vec2 direction = rayDir;
      if (mouseInfluence > 0.0) {
        vec2 mouseScreenPos = mousePos * iResolution;
        vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
        direction = normalize(mix(rayDir, mouseDirection, mouseInfluence));
      }

      float firstRay = rayStrength(rayPos, direction, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
      float secondRay = rayStrength(rayPos, direction, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
      float alpha = firstRay * 0.5 + secondRay * 0.4;
      vec3 color = vec3(alpha);

      if (noiseAmount > 0.0) {
        float grain = noise(coord * 0.01 + iTime * 0.1);
        color *= 1.0 - noiseAmount + noiseAmount * grain;
      }

      float brightness = 1.0 - coord.y / max(iResolution.y, 1.0);
      color.r *= 0.1 + brightness * 0.8;
      color.g *= 0.3 + brightness * 0.6;
      color.b *= 0.5 + brightness * 0.5;
      if (saturation != 1.0) {
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(gray), color, saturation);
      }
      color *= raysColor;
      gl_FragColor = vec4(color * alpha, alpha);
    }
  `;

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error || 'Unable to compile light ray shader');
    }
    return shader;
  };

  let gl;
  let frame = 0;
  let startTime = 0;
  let width = 0;
  let height = 0;
  let currentMouse = [0.5, 0.32];
  let targetMouse = [0.5, 0.32];
  let hasRendered = false;
  let contextLost = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');

  try {
    gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power'
    });
    if (!gl) throw new Error('WebGL is unavailable');

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Unable to link light ray shader');
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = Object.fromEntries([
      'iTime', 'iResolution', 'rayPos', 'rayDir', 'mousePos', 'raysColor',
      'raysSpeed', 'lightSpread', 'rayLength', 'pulsating', 'fadeDistance',
      'saturation', 'mouseInfluence', 'noiseAmount', 'distortion'
    ].map(name => [name, gl.getUniformLocation(program, name)]));

    mount.appendChild(canvas);
    mount.dataset.fallback = 'false';

    const resize = () => {
      const bounds = mount.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(bounds.width * dpr));
      height = Math.max(1, Math.round(bounds.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.iResolution, width, height);
      // React Bits defaults: source just above center, rays travel downward.
      gl.uniform2f(uniforms.rayPos, width * 0.5, -height * 0.2);
      gl.uniform2f(uniforms.rayDir, 0, 1);
      gl.uniform3f(uniforms.raysColor, 1.0, 0.79, 0.34);
      gl.uniform1f(uniforms.raysSpeed, 1.0);
      gl.uniform1f(uniforms.lightSpread, 1.0);
      gl.uniform1f(uniforms.rayLength, 2.0);
      gl.uniform1f(uniforms.pulsating, 0.0);
      gl.uniform1f(uniforms.fadeDistance, 1.0);
      gl.uniform1f(uniforms.saturation, 1.0);
      gl.uniform1f(uniforms.mouseInfluence, 0.1);
      gl.uniform1f(uniforms.noiseAmount, 0.1);
      gl.uniform1f(uniforms.distortion, 0.2);
    };

    const isHomeVisible = () => {
      if (document.hidden || screen.classList.contains('hidden')) return false;
      const style = getComputedStyle(screen);
      return style.display !== 'none' && style.visibility !== 'hidden' &&
        screen.getBoundingClientRect().width > 0;
    };

    const render = now => {
      frame = 0;
      if (!isHomeVisible() || contextLost) return;
      hasRendered = true;
      if (!startTime) startTime = now;
      currentMouse[0] += (targetMouse[0] - currentMouse[0]) * 0.04;
      currentMouse[1] += (targetMouse[1] - currentMouse[1]) * 0.04;
      gl.uniform1f(uniforms.iTime, reducedMotion.matches ? 0 : (now - startTime) * 0.001);
      gl.uniform2f(uniforms.mousePos, currentMouse[0], currentMouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reducedMotion.matches) frame = requestAnimationFrame(render);
    };

    const syncAnimation = () => {
      if (isHomeVisible() && !contextLost) {
        resize();
        if (reducedMotion.matches) {
          if (!hasRendered) render(performance.now());
        } else if (!frame) frame = requestAnimationFrame(render);
      } else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    window.addEventListener('pointermove', event => {
      targetMouse = [event.clientX / Math.max(window.innerWidth, 1), event.clientY / Math.max(window.innerHeight, 1)];
    }, { passive: true });
    document.addEventListener('visibilitychange', syncAnimation);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      contextLost = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      mount.dataset.fallback = 'true';
    });
    canvas.addEventListener('webglcontextrestored', () => {
      contextLost = true;
      mount.dataset.fallback = 'true';
    });
    new MutationObserver(syncAnimation).observe(screen, { attributes: true, attributeFilter: ['class', 'style'] });
    const resizeObserver = new ResizeObserver(() => { hasRendered = false; resize(); syncAnimation(); });
    resizeObserver.observe(screen);
    reducedMotion.addEventListener('change', () => {
      hasRendered = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      syncAnimation();
    });
    window.addEventListener('resize', resize, { passive: true });
    resize();
    syncAnimation();
  } catch (error) {
    console.warn('[home-light-rays] Falling back to static glow:', error);
    mount.dataset.fallback = 'true';
  }
})();
