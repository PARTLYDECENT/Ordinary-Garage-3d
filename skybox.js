function createSkybox(scene) {
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);

    const shaderMaterial = new BABYLON.ShaderMaterial("skyShader", scene, {
        vertexSource: `
            precision highp float;

            // Attributes
            attribute vec3 position;

            // Uniforms
            uniform mat4 worldViewProjection;

            // Varying
            varying vec3 vPosition;

            void main(void) {
                vPosition = position;
                gl_Position = worldViewProjection * vec4(position, 1.0);
            }
        `,
        fragmentSource: `
            precision highp float;

            varying vec3 vPosition;
            uniform float time;

            // Rotation matrix
            mat2 rot(float a) {
                float c = cos(a);
                float s = sin(a);
                return mat2(c, -s, s, c);
            }

            // Hash function for randomness
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            // Noise function
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            // Fractal noise
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                for(int i = 0; i < 6; i++) {
                    value += amplitude * noise(p);
                    p *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            // Grid function with morphing
            float grid(vec2 p, float scale, float morph) {
                p *= scale;
                
                // Add some warping
                p += vec2(sin(p.y * 0.5 + time * 2.0), cos(p.x * 0.3 + time * 1.5)) * morph;
                
                vec2 grid_p = abs(fract(p) - 0.5);
                float line_width = 0.02 + 0.03 * sin(time * 3.0 + length(p) * 0.1);
                
                return smoothstep(line_width, line_width * 0.5, min(grid_p.x, grid_p.y));
            }

            // Tunnel effect
            vec3 tunnel(vec3 dir) {
                float t = time * 0.5;
                vec2 uv = dir.xy / (dir.z + 0.5);
                
                // Rotate the tunnel
                uv *= rot(t * 0.2);
                
                // Multiple grid layers with different scales and colors
                float grid1 = grid(uv, 8.0 + sin(t) * 4.0, 0.3);
                float grid2 = grid(uv, 16.0 + cos(t * 1.3) * 8.0, 0.2);
                float grid3 = grid(uv, 32.0 + sin(t * 0.7) * 16.0, 0.1);
                
                // Color the grids
                vec3 col1 = vec3(1.0, 0.2, 0.8) * grid1; // Hot pink
                vec3 col2 = vec3(0.2, 1.0, 0.8) * grid2; // Cyan
                vec3 col3 = vec3(0.8, 0.8, 0.2) * grid3; // Yellow
                
                // Combine with additive blending
                vec3 color = col1 + col2 + col3;
                
                // Add some glow based on distance
                float dist = length(uv) * 0.1;
                color *= (1.0 + sin(dist - t * 2.0) * 0.5);
                
                // Fade with depth
                float depth_fade = 1.0 / (1.0 + dir.z * dir.z * 0.1);
                color *= depth_fade;
                
                return color;
            }

            // Plasma background
            vec3 plasma(vec2 p) {
                float t = time * 0.3;
                float x = p.x;
                float y = p.y;
                
                float v = sin((x * 10.0 + t));
                v += sin((y * 10.0 + t) / 2.0);
                v += sin((x * 10.0 + y * 10.0 + t) / 2.0);
                
                float cx = x + 0.5 * sin(t / 5.0);
                float cy = y + 0.5 * cos(t / 3.0);
                v += sin(sqrt(100.0 * (cx * cx + cy * cy) + 1.0) + t);
                
                v = v / 4.0;
                
                return vec3(
                    sin(v * 3.14159),
                    sin(v * 3.14159 + 2.0 * 3.14159 / 3.0),
                    sin(v * 3.14159 + 4.0 * 3.14159 / 3.0)
                ) * 0.3;
            }

            void main() {
                vec2 uv = vPosition.xy;
                vec3 dir = normalize(vec3(uv, 1.0));
                
                // Rotate the whole thing
                float rotation_speed = time * 0.1;
                dir.xy *= rot(rotation_speed);
                dir.xz *= rot(rotation_speed * 0.7);
                
                // Get the tunnel color
                vec3 color = tunnel(dir);
                
                // Add plasma background
                color += plasma(uv * 2.0);
                
                // Add some noise for texture
                float n = fbm(uv * 5.0 + time * 0.5) * 0.1;
                color += n;
                
                // Boost contrast and add some pulsing
                float pulse = 1.0 + sin(time * 4.0) * 0.3;
                color = pow(color, vec3(0.8)) * pulse;
                
                // Vignette effect
                float vignette = 1.0 - length(uv) * 0.5;
                color *= vignette;
                
                gl_FragColor = vec4(color, 1.0);
            }
        `,
    }, {
        attributes: ["position"],
        uniforms: ["worldViewProjection", "time"]
    });

    let time = 0;
    scene.onBeforeRenderObservable.add(() => {
        shaderMaterial.setFloat("time", time);
        time += 0.016; // Slightly faster for more action
    });

    skybox.material = shaderMaterial;
    skybox.infiniteDistance = true;

    return skybox;
}