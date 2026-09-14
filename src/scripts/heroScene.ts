import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { PMREMGenerator } from 'three';

/**
 * Encapsulates the Three.js scene used in the hero section.
 * Kept framework-agnostic so it can be unit-tested or reused
 * outside of Astro if needed.
 */
export class HeroScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  // private mesh: THREE.Mesh;
  private clock: THREE.Timer;
  private frameId: number = 0;
  private animationMixer: THREE.AnimationMixer | null = null;
  private resizeObserver: ResizeObserver;

  constructor(private container: HTMLElement, onProgressCallback: (percent:number|null)=>void, onStartCallback: ()=>void) {

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.z = 1;
    this.camera.position.x = 1;
    this.camera.position.y = 1;


    const controls = new OrbitControls(this.camera, container);
    controls.target.set(0, 0, 0);
    controls.update();
    

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
  

    const dracoloader = new DRACOLoader();
    dracoloader.setDecoderPath('/draco/');

    const GLTFloader = new GLTFLoader();
    GLTFloader.setDRACOLoader(dracoloader);
    GLTFloader.load('/washitsu.glb', (glb) => {
      glb.scene.traverse((child) => {

        if (child instanceof THREE.Mesh) {
          const mesh = child;
          if(child.name === "Slattes001") {
            (mesh.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
          }
          
          if(child.name.match(/^Screen00\d+/)) {
            child.material.emissive = new THREE.Color(0xffffff);
            child.material.emissiveIntensity = 0.4;
          }

          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      onProgressCallback?.(80); //Finsihed Adding shadows

      this.scene.add(glb.scene);

      //Add the animations to the scene
      const animations = glb.animations;
      if (animations && animations.length > 0) {
        this.animationMixer = new THREE.AnimationMixer(glb.scene);
        const action = this.animationMixer.clipAction(animations[0]);
        action.play();
      }

      onProgressCallback?.(85); //Finished Adding animation


      //Set the cameras for the scene
      const cameras = glb.cameras;

      if (cameras && cameras.length > 0) {
        
        this.camera = cameras[0] as THREE.PerspectiveCamera;
        
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
      }

      onProgressCallback?.(90); //Finsihed Adding cameras


      onStartCallback();
      
      
      }, (progress: ProgressEvent) => {
        if (progress.lengthComputable) { //If the model has a valid indicator of progress.
          const percent = (progress.loaded / progress.total) * 100 * 0.75; //Let the model loading be the first half of the progress bar
          onProgressCallback?.(percent); 
        } else {
          
          onProgressCallback?.(null);
        }
      },(error) => {
        console.error('An error happened while loading the model:', error);
      }
    )

    //Finished adding the objects to the scene




    //Generate the environment map from the equirectangular texture
    const pmremGenerator = new PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const backgroundLoader = new THREE.TextureLoader();
    const texture = backgroundLoader.load('/seaBackground.jpg', () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      const imageWidth = texture.image.width;
      const imageHeight = texture.image.height;
      const aspectRatio = imageWidth / imageHeight;

      const geometry = new THREE.PlaneGeometry(5 * aspectRatio, 5);

      const seaImageMaterial = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide
      });
      const imageMesh = new THREE.Mesh(geometry, seaImageMaterial);
      imageMesh.position.set(-5,1,-0.5)
      imageMesh.lookAt(0,1,-0.5)
      this.scene.add(imageMesh);
      

      const envMap = pmremGenerator.fromEquirectangular(texture).texture;

      this.scene.background = texture;   
      // this.scene.environment = envMap;

      texture.dispose();
      pmremGenerator.dispose();

    });

    
    //Add in the view outside the window


    //Add the lighting to the scene
    //Main sun light
    this.scene.add(new THREE.AmbientLight(0xfff2d8, 0.1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 5);
    dirLight.position.set(-1*4+ 0, (1.5-0.25)*4 + 0.25, (0.65+0.5)*4 + -0.5);
    dirLight.castShadow = true;

    dirLight.target.position.set(0, 0.25, -0.5);

    dirLight.shadow.mapSize.set(1024, 1024); // resolution — trade off vs perf
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = -5
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    dirLight.shadow.bias = -0.0002; // helps with shadow acne if you see stripes

    
    this.scene.add(dirLight);

    



    //The light inside the room that is supposed to come from the sun. 
    const insidedirLight = new THREE.DirectionalLight(0xffffff, 1);
    insidedirLight.position.set(-1*0.5+ 0, (1.5-0.25)*0.5 + 0.25, (0.65+0.5)*0.5 + -0.5);
    insidedirLight.castShadow = true;
    insidedirLight.target.position.set(0, 0.25, -0.5);


    insidedirLight.shadow.mapSize.set(1024, 1024); // resolution — trade off vs perf
    insidedirLight.shadow.camera.near = 0.1;
    insidedirLight.shadow.camera.far = 20;
    insidedirLight.shadow.camera.left = -1;
    insidedirLight.shadow.camera.right = 1;
    insidedirLight.shadow.camera.top = 1;
    insidedirLight.shadow.camera.bottom = -1;
    insidedirLight.shadow.bias = -0.0002;
    this.scene.add(insidedirLight);

    


    //The light to illumiate the plant section
    const plantlight = new THREE.PointLight(0xffffff, 2, 5, 0.5);
    plantlight.position.set(-1, 2.25, -2.75);
    plantlight.castShadow = true;

    plantlight.shadow.mapSize.set(1024, 1024); // resolution — trade off vs perf
    plantlight.shadow.camera.near = 0.1;
    plantlight.shadow.camera.far = 6;
    plantlight.shadow.bias = -0.0002;
    this.scene.add(plantlight);
    RectAreaLightUniformsLib.init()
   
    //Wall light to give a glow and illumination from the windows
    const walllight = new THREE.RectAreaLight(0xfff2d8, 1.5, 4, 2);
    walllight.position.set(0, 1, 1.55);
    walllight.lookAt(0, 1, 0);
    
    this.scene.add(walllight);

    const light = new THREE.RectAreaLight(0xfff2d8, 1.5, 4, 2);
    light.position.set(-2, 1, -0.25);
    light.lookAt(0, 1, -0.25);


    
    this.scene.add(light);


    //Add a light to light up the first door at the start of the render

    const doorlight = new THREE.PointLight(0xfff2d8, 2, 2, 0.1)
    doorlight.position.set(3,1,-0.5)
    // doorlight.castShadow = true;

    // doorlight.shadow.mapSize.set(1024, 1024);
    // doorlight.shadow.bias = -0.0002;

    this.scene.add(doorlight)
    
    this.clock = new THREE.Timer();

    // Keep the canvas sized to its container rather than the window,
    // so the hero can be resized independently of the viewport.
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // // 5. Add Core Coordinate Helpers
    //         // AxesHelper: X = Red, Y = Green, Z = Blue
    //         const axesHelper = new THREE.AxesHelper(15);
    //         // Increase thickness of lines slightly by making them render on top
    //         // axesHelper.material.depthTest = false;
    //         axesHelper.renderOrder = 1; 
    //         this.scene.add(axesHelper);

    //         // 6. Add Grid Planes
    //         // Primary Horizontal Grid (X-Z Plane)
    //         const gridXZ = new THREE.GridHelper(40, 40, 0x888888, 0x444444);
    //         this.scene.add(gridXZ);

    //         // Optional Vertical Grid (X-Y Plane) for full 3D reference
    //         const gridXY = new THREE.GridHelper(40, 40, 0x888888, 0x444444);
    //         gridXY.rotation.x = Math.PI / 2;
    //         gridXY.position.y = 0;
    //         // Lower opacity so it doesn't clutter visual space
    //         gridXY.material.opacity = 0.25;
    //         gridXY.material.transparent = true;
    //         this.scene.add(gridXY);

    

  }


  private handleResize(): void {
    const { clientWidth, clientHeight } = this.container;
    if (clientWidth === 0 || clientHeight === 0) return;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight);
    this.startrender()
  }

  private animate = () :void => {
    this.clock.update();
    this.animationMixer?.update(this.clock.getDelta());
    this.renderer.render(this.scene, this.camera);
  }

  public setanimateframe(frameid:number):void {
    this.animationMixer?.setTime(frameid/24);
    this.renderer.render(this.scene, this.camera);
    this.frameId = frameid
  }

  start(): void {
    this.renderer.setAnimationLoop(this.animate);
  }

  startrender():void {
    this.renderer.render(this.scene, this.camera);
    // this.animationMixer?.setTime(1/24);
    this.animationMixer?.setTime(this.frameId/24)
  }

  stop(): void {
    this.renderer.setAnimationLoop(null);
  }

  dispose(): void {
    this.stop();
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
