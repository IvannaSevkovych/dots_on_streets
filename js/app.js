import * as THREE from "three";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertexParticles.glsl";
import image from "../map.jpg";
let OrbitControls = require("three-orbit-controls")(THREE);

export default class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x111111, 1);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            10000
        );

        // var frustumSize = 10;
        // var aspect = window.innerWidth / window.innerHeight;
        // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
        this.camera.position.set(0, 0, 400);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;

        this.isPlaying = true;

        this.linesProps = this.drawLines('.cls-1');
        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
        // this.settings();
    }

    settings() {
        let that = this;
        this.settings = {
            progress: 0,
        };
        this.gui = new dat.GUI();
        this.gui.add(this.settings, "progress", 0, 1, 0.01);
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        let that = this;
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            blending: THREE.AdditiveBlending,
            vertexShader: vertex,
            fragmentShader: fragment
        });

        this.geometry = new THREE.BufferGeometry();
        this.pointsPerLine = 100;
        const totalPoints = this.linesProps.length * this.pointsPerLine;
        const positions = this.linesProps.flatMap(prop => prop.linePoints.slice(0,this.pointsPerLine*3));
        const randomness = Array.from({length: totalPoints}, () => Math.random());

        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.geometry.setAttribute('randomness', new THREE.BufferAttribute(new Float32Array(randomness), 1));

        this.plane = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.plane);

        const texture = new THREE.TextureLoader().load(image);
        texture.flipY = false;
        const map = new  THREE.Mesh(
            new THREE.PlaneBufferGeometry(2048,1024,1,1),
            new THREE.MeshBasicMaterial({
                color: 0x000033,
                blending: THREE.MultiplyBlending,
                map: texture
            })
        )
        this.scene.add(map);
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.render()
            this.isPlaying = true;
        }
    }

    render() {
        this.updateLines();
        if (!this.isPlaying) return;
        this.time += 0.05;
        this.material.uniforms.time.value = this.time;
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    drawLines(className) {
        const svg = [...document.querySelectorAll(className)];

        const linesProps = [];

        svg.forEach((path, id)=>{
            const lineLength = path.getTotalLength();
            const numberOfPoints = Math.floor(lineLength/5);

            const linePoints = [];

            for (let i = 0; i < numberOfPoints; i++) {
                const lineProgress = lineLength/numberOfPoints*i;
                const point = path.getPointAtLength(lineProgress);
                const randomX = (Math.random() -0.5)*2;
                const randomY = (Math.random() -0.5)*2;
                linePoints.push(point.x-1024 + randomX, point.y-512 + randomY, 0)
            }

            linesProps.push({
                id,
                path,
                lineLength,
                numberOfPoints,
                linePoints,
                currentPointIndex : 0
            })
        })

        return linesProps;
    }

    updateLines() {
        const positions = [];
        const randomness = [];
        this.linesProps.forEach(line=>{
            line.currentPointIndex++;
            for (let i = 0; i < this.pointsPerLine; i++) {
                let index = (line.currentPointIndex+i)%line.numberOfPoints;
                positions.push(
                    line.linePoints[3*index],
                    line.linePoints[3*index+1],
                    line.linePoints[3*index+2]
                );

                randomness.push(i/100);
            }
        })


        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
        this.geometry.setAttribute('randomness', new THREE.BufferAttribute(new Float32Array(randomness), 1));
        //this.geometry.attributes.position.needsUpdate = true;
    }
}

new Sketch({
    dom: document.getElementById("container")
});
