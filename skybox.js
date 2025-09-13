/**
 * WAR-TORN PLANET DYNAMIC SKYBOX SYSTEM - MAXIMUM CHAOS EDITION
 *
 * Version: 2.0 (Repaired and Enhanced)
 * Originally by: Anonymous
 * Fixed by: Gemini
 *
 * Description: An epic, shader-based dynamic skybox for Babylon.js.
 * Features 20+ programmable battle phases, from 'peaceful' to 'eldritch',
 * with dimensional rifts, alien invasions, and reality-warping vertex effects.
 *
 * HOW TO USE:
 * 1. Include Babylon.js in your project.
 * 2. Include this `skybox.js` file.
 * 3. In your scene creation code, create an instance:
 * const warSky = createWarSkybox(scene, { options });
 * // or use a preset:
 * // const warSky = createWarPresetSkybox(scene, 'apocalypse');
 *
 * 4. Control from the console (e.g.):
 * warSky.setBattlePhase('nuclear');
 * warSky.triggerAlienInvasion();
 * warSky.startApocalypseSequence();
 */

class WarTornPlanetSky {
    constructor(scene) {
        this.scene = scene;
        this.skybox = null;
        this.material = null;
        this.time = 0;

        // --- State Management ---
        this.battleState = {}; // Current interpolated state
        this.fromState = {};   // State we are transitioning from
        this.toState = {};     // State we are transitioning to
        this.transition = {
            startTime: 0,
            duration: 5000, // Default transition time: 5 seconds
            active: false,
        };
        
        // Centralized configuration for all battle phases
        this.BATTLE_CONFIG = this.getBattleConfigurations();
        this.resetBattleState('peaceful'); // Initialize state

        this.init();
        this.startAnimation();
    }

    init() {
        this.skybox = BABYLON.MeshBuilder.CreateSphere("warTornSkybox", {
            diameter: 2500.0,
            segments: 128
        }, this.scene);

        this.createWarShaderMaterial();
        this.skybox.material = this.material;
        this.skybox.infiniteDistance = true;
    }

    createWarShaderMaterial() {
        // GLSL Shaders (Vertex and Fragment)
        const vertexShader = `
            precision highp float;
            
            attribute vec3 position;
            attribute vec3 normal;
            
            uniform mat4 worldViewProjection;
            uniform mat4 world;
            uniform vec3 cameraPosition;
            uniform float time;
            uniform float smokeIntensity;
            uniform float plasmaStorms;
            uniform float orbitalBombardment;
            uniform float electricalStorms;
            uniform float dimensionalRifts;
            uniform float voidTears;
            uniform float quantumInstability;
            uniform float gravityWaves;
            uniform float timeDistortion;
            uniform float cosmicHorror;
            
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec3 vDirectionW;
            varying float vWarDistortion;
            varying float vRealityTear;
            varying float vQuantumShift;

            float hash(float n) { return fract(sin(n) * 1399763.5453); }

            float noise(vec3 x) {
                vec3 p = floor(x);
                vec3 f = fract(x);
                f = f * f * (3.0 - 2.0 * f);
                float n = p.x + p.y * 157.0 + 113.0 * p.z;
                return mix(mix(mix(hash(n), hash(n + 1.0), f.x),
                           mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
                           mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                           mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
            }

            float fbm(vec3 p) {
                float f = 0.0;
                f += 0.5000 * noise(p); p *= 2.17;
                f += 0.2500 * noise(p); p *= 2.32;
                f += 0.1250 * noise(p); p *= 2.41;
                f += 0.0625 * noise(p);
                return f / 0.9375;
            }

            void main(void) {
                vec3 pos = position;
                vec3 norm = normal;
                
                // Distortion effects
                float turbulence = sin(time * 3.0 + length(position) * 0.015) * orbitalBombardment * 0.12;
                float plasma = pow(max(0.0, fbm(position * 0.025 + time * 0.8) - 0.3), 2.0) * plasmaStorms * 0.18;
                float electrical = sin(time * 8.0 + dot(position, vec3(0.7, 1.0, 0.3)) * 0.02) * electricalStorms * 0.08;
                float riftWarp = sin(fbm(position * 0.08 + time * 1.5) * 15.0) * dimensionalRifts * 0.3;
                float voidWarp = pow(max(0.0, fbm(position * 0.12 - time * 2.0) - 0.6), 3.0) * voidTears * 0.4;
                float quantum = (sin(time * 20.0 + length(position) * 0.05) * cos(time * 20.0 * 3.7)) * quantumInstability * 0.15;
                float gravityField = sin(time * 0.5 + length(position) * 0.003) * gravityWaves * 0.2;
                float timeWarp = sin(fbm(position * 0.03 + time * 0.1) * 12.0 + time * 5.0) * timeDistortion * 0.1;
                float horror = pow(max(0.0, fbm(position * 0.02 + time * 0.3) - 0.5), 2.5) * cosmicHorror * 0.25;

                vWarDistortion = turbulence + plasma + electrical;
                vRealityTear = voidWarp + horror + riftWarp;
                vQuantumShift = quantum + gravityField + timeWarp;
                
                pos += norm * (vWarDistortion + vRealityTear + vQuantumShift * 0.5);
                
                vec4 worldPos = world * vec4(pos, 1.0);
                vPositionW = vec3(worldPos);
                vNormalW = normalize(vec3(world * vec4(norm, 0.0)));
                vDirectionW = normalize(vPositionW - cameraPosition);
                
                gl_Position = worldViewProjection * vec4(pos, 1.0);
            }
        `;

        const fragmentShader = `
            precision highp float;
            
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec3 vDirectionW;
            varying float vWarDistortion;
            varying float vRealityTear;
            varying float vQuantumShift;
            
            uniform float time;
            uniform float smokeIntensity;
            uniform float plasmaStorms;
            uniform float orbitalBombardment;
            uniform float toxicClouds;
            uniform float electricalStorms;
            uniform float ashfall;
            uniform float nuclearWinter;
            uniform float dimensionalRifts;
            uniform float voidTears;
            uniform float acidRain;
            uniform float meteorShowers;
            uniform float alienInvasion;
            uniform float psychicStorms;
            uniform float quantumInstability;
            uniform float bioWeapons;
            uniform float solarFlares;
            uniform float gravityWaves;
            uniform float timeDistortion;
            uniform float cosmicHorror;
            uniform vec3 sunPosition;

            float hash21(vec2 p) {
                p = fract(p * vec2(127.1, 311.7));
                p += dot(p, p + 33.33);
                return fract(p.x * p.y);
            }
            
            float hash31(vec3 p) {
                p = fract(p * vec3(443.8971, 397.2973, 491.1871));
                p += dot(p, p.yxz + 19.19);
                return fract((p.x + p.y) * p.z);
            }

            vec3 hash33(vec3 p) {
                p = fract(p * vec3(443.897, 397.297, 491.187));
                p += dot(p, p.yxz + 19.19);
                return fract((p.xxy + p.yxx) * p.zyx);
            }

            float noise3d(vec3 p) {
                vec3 i = floor(p); vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
                           mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
                           mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
                           mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y), f.z);
            }

            float fbm3d(vec3 p) {
                float f = 0.0;
                f += 0.5000 * noise3d(p); p *= 2.13;
                f += 0.2500 * noise3d(p); p *= 2.27;
                f += 0.1250 * noise3d(p);
                return f / 0.875;
            }

            // --- Individual Effect Systems ---

            float orbitalExplosions(vec2 uv, float density, float intensity) {
                vec2 grid = floor(uv * density);
                vec2 gridUv = fract(uv * density);
                float explosions = 0.0;
                for(int i = -1; i <= 1; i++) {
                    for(int j = -1; j <= 1; j++) {
                        vec2 offset = vec2(float(i), float(j));
                        vec2 cellGrid = grid + offset;
                        float cellHash = hash21(cellGrid + floor(time * 2.0));
                        if(cellHash > 0.8) {
                            vec2 explosionCenter = vec2(0.5) + 0.4 * (hash33(vec3(cellGrid, floor(time * 1.5))).xy - 0.5);
                            float dist = length(gridUv - offset - explosionCenter);
                            float explosionTime = fract(time * 3.0 + cellHash * 10.0);
                            float shockwave = 1.0 - smoothstep(0.0, 0.4, abs(dist - explosionTime * 0.5));
                            float fireball = 1.0 - smoothstep(0.0, 0.2 * (1.0 - explosionTime), dist);
                            explosions += (shockwave * 0.8 + fireball * 2.0) * intensity * cellHash;
                        }
                    }
                }
                return explosions;
            }

            vec3 warSmokeColumns(vec3 dir, float timeOffset) {
                vec2 uv = vec2(atan(dir.z, dir.x) / 6.283, asin(dir.y) / 3.14159 + 0.5);
                float column = 1.0 - smoothstep(0.02, 0.15, abs(uv.x - 0.3)) * smoothstep(0.3, 0.8, uv.y);
                column *= 1.0 - smoothstep(0.015, 0.12, abs(uv.x - 0.7)) * smoothstep(0.2, 0.9, uv.y);
                float turbulence = fbm3d(dir * 15.0 + timeOffset * 0.3);
                float smoke = (1.0 - column) * (0.7 + 0.3 * turbulence);
                return vec3(0.15) * smoke * smokeIntensity * 1.3;
            }
            
            vec3 toxicCloudSystem(vec3 dir, float timeOffset) {
                float density = fbm3d(dir * 3.0 + timeOffset * 0.1);
                density = smoothstep(0.4, 0.7, density);
                return vec3(0.4, 0.6, 0.2) * density * toxicClouds;
            }
            
            vec3 plasmaStormSystem(vec3 dir, float timeOffset) {
                float energy = fbm3d(dir * 7.0 + timeOffset * 1.2);
                energy = pow(max(0.0, energy - 0.4), 2.0);
                return vec3(1.2, 0.8, 1.5) * energy * plasmaStorms;
            }

            // [FIXED] Implemented missing shader functions
            vec3 electricalStormSystem(vec3 dir, float timeOffset) {
                vec3 p = dir * 6.0;
                float flash = step(0.995, hash31(vec3(floor(timeOffset * 20.0))));
                float bolts = fbm3d(p * vec3(2.0, 8.0, 2.0) + timeOffset * 5.0);
                bolts = 1.0 - smoothstep(0.0, 0.05, abs(bolts - 0.5));
                float lightning = (flash * 2.0 + bolts) * electricalStorms;
                return vec3(0.7, 0.8, 1.0) * lightning;
            }

            vec3 nuclearWinterSystem(vec3 dir, float timeOffset) {
                float density = fbm3d(dir * 2.0 - timeOffset * 0.05);
                density = smoothstep(0.3, 0.7, density);
                return vec3(0.4, 0.4, 0.35) * density * nuclearWinter;
            }

            vec3 ashfallSystem(vec3 dir, float timeOffset) {
                vec2 uv = dir.xz + dir.y;
                float ash = 0.0;
                for (int i=0; i<5; i++) {
                    float fi = float(i);
                    float t = fract(timeOffset * (0.2 + fi * 0.1) + fi * 1.618);
                    vec2 pos = vec2(hash21(vec2(fi)), t);
                    ash += (1.0 - smoothstep(0.0, 0.05, length(uv - pos))) * (1.0 - t);
                }
                return vec3(0.2) * ash * ashfall;
            }

            vec3 dimensionalRiftSystem(vec3 dir, float timeOffset) {
                float riftNoise = fbm3d(dir * 5.0 + timeOffset * 1.5);
                float riftField = pow(max(0.0, riftNoise - 0.5), 2.5);
                return vec3(0.8, 0.2, 1.2) * riftField * dimensionalRifts;
            }

            vec3 voidTearSystem(vec3 dir, float timeOffset) {
                float voidField = fbm3d(dir * 8.0 - timeOffset * 3.0);
                voidField = pow(max(0.0, voidField - 0.6), 4.0);
                float absoluteVoid = step(0.9, voidField);
                return vec3(0.0) * absoluteVoid * voidTears;
            }

            vec3 acidRainSystem(vec3 dir, float timeOffset) { return vec3(0.2, 0.8, 0.3) * acidRain * noise3d(dir * 20.0 + timeOffset * 8.0); }
            vec3 meteorShowerSystem(vec3 dir, float timeOffset) { return vec3(1.5, 0.8, 0.3) * meteorShowers * step(0.99, noise3d(dir * 10.0 + timeOffset * 2.0)); }
            vec3 alienInvasionSystem(vec3 dir, float timeOffset) { return vec3(0.8, 0.2, 1.5) * alienInvasion * fbm3d(dir * 6.0 + timeOffset * 0.8); }
            vec3 psychicStormSystem(vec3 dir, float timeOffset) { return vec3(1.2, 0.4, 0.8) * psychicStorms * fbm3d(dir * 4.0 + timeOffset * 1.2); }
            vec3 bioWeaponSystem(vec3 dir, float timeOffset) { return vec3(0.4, 0.8, 0.2) * bioWeapons * fbm3d(dir * 7.0 + timeOffset * 0.6); }
            vec3 solarFlareSystem(vec3 dir, float timeOffset) { return vec3(1.5, 0.8, 0.3) * solarFlares * pow(max(0.0, dot(dir, normalize(sunPosition))), 10.0); }
            vec3 quantumInstabilitySystem(vec3 dir, float timeOffset) { return vec3(0.4, 0.8, 2.0) * quantumInstability * step(0.95, noise3d(dir*20.0 + timeOffset * 15.0)); }
            vec3 gravityWaveSystem(vec3 dir, float timeOffset) { return vec3(0.3, 0.7, 1.4) * gravityWaves * pow(max(0.0, sin(length(dir*2.0) * 5.0 - timeOffset * 3.0)), 2.0); }
            vec3 timeDistortionSystem(vec3 dir, float timeOffset) { return vec3(0.4, 1.2, 1.0) * timeDistortion * fbm3d(dir * 4.0 + timeOffset * 0.3); }
            vec3 cosmicHorrorSystem(vec3 dir, float timeOffset) { return vec3(0.2, 0.1, 0.4) * cosmicHorror * pow(max(0.0, fbm3d(dir * 3.0 + timeOffset * 0.2) - 0.4), 3.0); }

            void main(void) {
                vec3 dir = normalize(vDirectionW);
                vec3 sunDir = normalize(sunPosition);

                // Base sky color
                float sunAngle = max(0.0, dot(dir, sunDir));
                vec3 baseColor = mix(vec3(0.1, 0.2, 0.4), vec3(0.8, 0.6, 0.4), pow(sunAngle, 0.5));
                baseColor += vec3(1.0, 0.9, 0.7) * pow(sunAngle, 200.0); // Sun disk
                
                // Explosions
                vec2 bombUV = vec2(atan(dir.z, dir.x)/6.283, asin(dir.y)/3.14159);
                float explosions = orbitalExplosions(bombUV * 8.0, 40.0, orbitalBombardment);
                vec3 explosionColor = vec3(1.5, 0.8, 0.3) * explosions;

                // Combine all war effects
                vec3 finalColor = baseColor;
                finalColor = mix(finalColor, warSmokeColumns(dir, time), smokeIntensity);
                finalColor += toxicCloudSystem(dir, time);
                finalColor += plasmaStormSystem(dir, time);
                finalColor += electricalStormSystem(dir, time);
                finalColor += nuclearWinterSystem(dir, time);
                finalColor += ashfallSystem(dir, time);
                finalColor += dimensionalRiftSystem(dir, time);
                finalColor += voidTearSystem(dir, time);
                finalColor += acidRainSystem(dir, time);
                finalColor += meteorShowerSystem(dir, time);
                finalColor += alienInvasionSystem(dir, time);
                finalColor += psychicStormSystem(dir, time);
                finalColor += bioWeaponSystem(dir, time);
                finalColor += solarFlareSystem(dir, time);
                finalColor += quantumInstabilitySystem(dir, time);
                finalColor += gravityWaveSystem(dir, time);
                finalColor += timeDistortionSystem(dir, time);
                finalColor += cosmicHorrorSystem(dir, time);
                finalColor += explosionColor;

                // Tone mapping
                finalColor = finalColor / (finalColor + vec3(0.8));
                finalColor = pow(max(finalColor, vec3(0.0)), vec3(1.0/2.2));
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        BABYLON.Effect.ShadersStore["customVertexShader"] = vertexShader;
        BABYLON.Effect.ShadersStore["customFragmentShader"] = fragmentShader;

        this.material = new BABYLON.ShaderMaterial("warShader", this.scene, {
            vertex: "custom",
            fragment: "custom"
        }, {
            attributes: ["position", "normal"],
            uniforms: ["world", "worldViewProjection", "cameraPosition", "sunPosition", "time",
                ...Object.keys(this.BATTLE_CONFIG.peaceful)
            ]
        });

        this.material.backFaceCulling = false;
    }

    updateUniforms() {
        if (!this.material) return;
        
        this.material.setFloat("time", this.time);
        this.material.setVector3("cameraPosition", this.scene.activeCamera.position);
        this.material.setVector3("sunPosition", new BABYLON.Vector3(500, 200, 500));

        // Set all battle state uniforms
        for (const key in this.battleState) {
            this.material.setFloat(key, this.battleState[key]);
        }
    }

    startAnimation() {
        this.scene.onBeforeRenderObservable.add(() => {
            const currentTime = performance.now();
            this.time += this.scene.getEngine().getDeltaTime() / 1000.0;
            
            // [FIXED] Handle battle phase transitions
            if (this.transition.active) {
                let progress = (currentTime - this.transition.startTime) / this.transition.duration;
                if (progress >= 1.0) {
                    progress = 1.0;
                    this.transition.active = false;
                }
                
                const easedProgress = this.easeInOutCubic(progress);

                for (const key in this.toState) {
                    this.battleState[key] = this.lerp(this.fromState[key], this.toState[key], easedProgress);
                }
            }
            
            this.updateUniforms();
        });
    }

    // --- Control Methods & Logic ---

    // [FIXED] Added transition logic
    transitionToBattle(battlePhase, duration = 8000) {
        if (!this.BATTLE_CONFIG[battlePhase]) {
            console.error(`Battle phase "${battlePhase}" not found.`);
            return;
        }

        console.log(`📡 Transitioning to phase: ${battlePhase}...`);

        this.fromState = { ...this.battleState };
        this.toState = this.BATTLE_CONFIG[battlePhase];
        this.transition.startTime = performance.now();
        this.transition.duration = duration;
        this.transition.active = true;
    }
    
    setBattlePhase(battlePhase) {
        this.transitionToBattle(battlePhase);
    }
    
    resetBattleState(phase) {
        const initialState = this.BATTLE_CONFIG[phase] || this.BATTLE_CONFIG.peaceful;
        this.battleState = { ...initialState };
        this.fromState = { ...initialState };
        this.toState = { ...initialState };
    }

    // --- Utility Methods ---
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // --- Enhanced Sequences & Events ---

    cycleAllBattlePhases() {
        const sequence = Object.keys(this.BATTLE_CONFIG);
        let currentIndex = 0;
        
        const nextPhase = () => {
            this.setBattlePhase(sequence[currentIndex]);
            currentIndex = (currentIndex + 1) % sequence.length;
            setTimeout(nextPhase, 8000);
        };
        nextPhase();
    }
    
    enableUltraRandomWarEvents() {
        const extremeEvents = [
            () => this.triggerUltimateApocalypse(), () => this.triggerDimensionalRift(),
            () => this.triggerVoidTear(), () => this.triggerAlienInvasion(),
            () => this.triggerCosmicHorror(), () => this.triggerQuantumChaos(),
            () => this.triggerTimeDistortion(), () => this.triggerPsychicStorm(),
            () => this.triggerSolarFlare(), () => this.triggerGravityWaves(),
            () => this.triggerBiologicalWarfare(), () => this.triggerMeteorShower(),
            () => this.triggerNuclearLaunch(), () => this.ceasefire()
        ];
        
        const triggerRandomEvent = () => {
            const event = extremeEvents[Math.floor(Math.random() * extremeEvents.length)];
            event();
            const nextEventTime = Math.random() * 25000 + 5000;
            setTimeout(triggerRandomEvent, nextEventTime);
        };
        setTimeout(triggerRandomEvent, 3000);
    }

    startApocalypseSequence() {
        console.log("🔥 APOCALYPSE SEQUENCE INITIATED...");
        const sequence = [
            { phase: 'tension', duration: 5000 }, { phase: 'conflict', duration: 8000 },
            { phase: 'war', duration: 10000 }, { phase: 'bombardment', duration: 12000 },
            { phase: 'invasion', duration: 15000 }, { phase: 'apocalypse', duration: 20000 },
            { phase: 'nuclear', duration: 15000 }, { phase: 'dimensional', duration: 25000 },
            { phase: 'void', duration: 30000 }, { phase: 'eldritch', duration: 20000 },
            { phase: 'wasteland', duration: 60000 }
        ];
        let currentIndex = 0;
        const nextPhase = () => {
            if (currentIndex < sequence.length) {
                const currentPhase = sequence[currentIndex];
                this.setBattlePhase(currentPhase.phase);
                currentIndex++;
                setTimeout(nextPhase, currentPhase.duration);
            } else {
                console.log("💀 APOCALYPSE SEQUENCE COMPLETE");
            }
        };
        nextPhase();
    }
    
    // [FIXED] Implemented missing trigger methods
    ceasefire() { this.setBattlePhase('peaceful'); }
    triggerUltimateApocalypse() { this.setBattlePhase('apocalypse'); }
    triggerDimensionalRift() { this.setBattlePhase('dimensional'); }
    triggerVoidTear() { this.setBattlePhase('void'); }
    triggerAlienInvasion() { this.setBattlePhase('alien'); }
    triggerCosmicHorror() { this.setBattlePhase('eldritch'); }
    triggerQuantumChaos() { this.setBattlePhase('quantum'); }
    triggerTimeDistortion() { this.setBattlePhase('temporal'); }
    triggerPsychicStorm() { this.setBattlePhase('psychic'); }
    triggerSolarFlare() { this.setBattlePhase('solar'); }
    triggerGravityWaves() { this.setBattlePhase('gravity'); }
    triggerBiologicalWarfare() { this.setBattlePhase('biological'); }
    triggerMeteorShower() { this.setBattlePhase('assault'); } // Remapped
    triggerCosmicWar() { this.setBattlePhase('cosmic'); }
    triggerOrbitalStrike() { this.setBattlePhase('bombardment'); }
    triggerPlasmaStorm() { this.setBattlePhase('conflict'); } // Remapped
    triggerNuclearLaunch() { this.setBattlePhase('nuclear'); }

    dispose() {
        if (this.skybox) this.skybox.dispose();
        if (this.material) this.material.dispose();
        console.log("🔥 War-torn skybox disposed.");
    }

    // --- Battle State Definitions ---

    getBattleConfigurations() {
        const base = {
            smokeIntensity: 0, plasmaStorms: 0, orbitalBombardment: 0, toxicClouds: 0,
            electricalStorms: 0, ashfall: 0, nuclearWinter: 0, dimensionalRifts: 0,
            voidTears: 0, acidRain: 0, meteorShowers: 0, alienInvasion: 0, psychicStorms: 0,
            quantumInstability: 0, bioWeapons: 0, solarFlares: 0, gravityWaves: 0,
            timeDistortion: 0, cosmicHorror: 0
        };

        return {
            'peaceful': { ...base },
            'tension': { ...base, smokeIntensity: 0.1, electricalStorms: 0.05 },
            'skirmish': { ...base, smokeIntensity: 0.3, orbitalBombardment: 0.1, electricalStorms: 0.1 },
            'conflict': { ...base, smokeIntensity: 0.5, orbitalBombardment: 0.3, plasmaStorms: 0.2, ashfall: 0.1 },
            'war': { ...base, smokeIntensity: 0.8, orbitalBombardment: 0.6, plasmaStorms: 0.3, toxicClouds: 0.2 },
            'assault': { ...base, smokeIntensity: 0.9, orbitalBombardment: 0.8, meteorShowers: 0.4, plasmaStorms: 0.4 },
            'bombardment': { ...base, smokeIntensity: 1.0, orbitalBombardment: 1.0, plasmaStorms: 0.5, ashfall: 0.5 },
            'invasion': { ...base, smokeIntensity: 0.7, orbitalBombardment: 0.8, alienInvasion: 0.8, plasmaStorms: 0.6 },
            'apocalypse': { ...base, smokeIntensity: 1.0, orbitalBombardment: 1.0, toxicClouds: 0.8, ashfall: 1.0, plasmaStorms: 0.8, solarFlares: 0.5 },
            'nuclear': { ...base, nuclearWinter: 1.0, ashfall: 0.8, toxicClouds: 0.6, electricalStorms: 0.7 },
            'biological': { ...base, bioWeapons: 1.0, toxicClouds: 1.0, acidRain: 0.7 },
            'dimensional': { ...base, dimensionalRifts: 1.0, quantumInstability: 0.4, electricalStorms: 0.5 },
            'cosmic': { ...base, solarFlares: 0.8, gravityWaves: 0.6, dimensionalRifts: 0.4 },
            'quantum': { ...base, quantumInstability: 1.0, timeDistortion: 0.3, gravityWaves: 0.3 },
            'temporal': { ...base, timeDistortion: 1.0, quantumInstability: 0.5 },
            'psychic': { ...base, psychicStorms: 1.0, dimensionalRifts: 0.2 },
            'void': { ...base, voidTears: 1.0, dimensionalRifts: 0.5, gravityWaves: 0.8 },
            'solar': { ...base, solarFlares: 1.0, plasmaStorms: 0.7 },
            'gravity': { ...base, gravityWaves: 1.0, voidTears: 0.2 },
            'alien': { ...base, alienInvasion: 1.0, plasmaStorms: 0.5, orbitalBombardment: 0.4 },
            'eldritch': { ...base, cosmicHorror: 1.0, voidTears: 0.6, psychicStorms: 0.7, dimensionalRifts: 0.5 },
            'aftermath': { ...base, smokeIntensity: 0.4, ashfall: 0.6, toxicClouds: 0.3 },
            'wasteland': { ...base, nuclearWinter: 0.8, ashfall: 1.0, toxicClouds: 0.5, smokeIntensity: 0.3 },
        };
    }
}


// --- Factory Functions (for easy creation) ---

function createWarSkybox(scene, options = {}) {
    const config = {
        initialBattle: 'peaceful',
        enableLogging: true,
        enableRandomEvents: false,
        enableApocalypseSequence: false,
        ...options
    };
    
    const warSky = new WarTornPlanetSky(scene);
    
    if (config.initialBattle !== 'peaceful') {
        setTimeout(() => {
            warSky.setBattlePhase(config.initialBattle);
        }, 1000);
    }
    
    if (config.enableRandomEvents) {
        warSky.enableUltraRandomWarEvents();
    }
    
    if (config.enableApocalypseSequence) {
        warSky.startApocalypseSequence();
    }
    
    if (typeof window !== 'undefined') {
        window.warSky = warSky; // For easy console access
        if (config.enableLogging) {
            console.log("🔥 WAR-TORN SKYBOX - MAXIMUM CHAOS EDITION LOADED 🔥");
            console.log("🚀 Access controls via the 'warSky' object in the console.");
            console.log("🚀 e.g., warSky.setBattlePhase('warzone') or warSky.startApocalypseSequence()");
        }
    }
    
    return warSky;
}

function createWarPresetSkybox(scene, preset = 'random') {
    const presets = {
        'peaceful': { initialBattle: 'peaceful' },
        'warzone': { initialBattle: 'war' },
        'apocalypse': { initialBattle: 'apocalypse' },
        'nuclear': { initialBattle: 'nuclear' },
        'dimensional': { initialBattle: 'dimensional' },
        'cosmic': { initialBattle: 'cosmic' },
        'eldritch': { initialBattle: 'eldritch' },
        'wasteland': { initialBattle: 'wasteland' },
        'chaos': { initialBattle: 'apocalypse', enableRandomEvents: true },
        'apocalypseSequence': { enableApocalypseSequence: true },
        'random': { initialBattle: ['skirmish', 'war', 'bombardment', 'invasion'][Math.floor(Math.random() * 4)] }
    };
    
    const config = presets[preset] || presets.random;
    return createWarSkybox(scene, config);
}


// --- Exports for module systems ---

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WarTornPlanetSky, createWarSkybox, createWarPresetSkybox };
} else if (typeof window !== 'undefined') {
    window.WarTornPlanetSky = WarTornPlanetSky;
    window.createWarSkybox = createWarSkybox;
    window.createWarPresetSkybox = createWarPresetSkybox;
}