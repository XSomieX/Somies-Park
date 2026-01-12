import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Octree } from "three/addons/math/Octree.js"
import { Capsule } from "three/addons/math/Capsule.js"

const splash = document.getElementById("splash-screen")
const enterBtn = document.getElementById("enter-btn")
const music = document.getElementById("bg-music")
const clickSound = document.getElementById("click-sound")
const themeToggle = document.getElementById("theme-toggle")
const musicToggle = document.getElementById("music-toggle")

clickSound.volume = 0.2;
const hopSound = document.getElementById("hop-sound");
hopSound.volume = 0.3;

function playClick() {
    clickSound.currentTime = 0
    clickSound.play().catch(() => {})
}
enterBtn.addEventListener("click", () => {
    playClick()

    const splash = document.getElementById("splash-screen")
    const ui = document.getElementById("ui-controls")
    const mobileControls = document.getElementById("mobile-controls")
    const music = document.getElementById("bg-music")    

    music.volume = 0.3;
    music.play().catch(() => {})

    splash.classList.add("hide")

    setTimeout(() => {
        ui.style.display = "flex"

        if (window.innerWidth <= 768) {
            mobileControls.classList.remove("hidden")
        }
    }, 800)
})

musicToggle.addEventListener("click", () => {
    playClick()
    music.muted = !music.muted
    musicToggle.classList.toggle("muted", music.muted)
})

let isNight = false
themeToggle.addEventListener("click", () => {
    playClick()
    isNight = !isNight
    themeToggle.classList.toggle("dark", isNight)
})

const loader = new GLTFLoader()
const scene = new THREE.Scene()
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

let intersectObject = ""
const intersectObjects = []
const intersectObjectsNames = ["project_1", "project_2", "project_3"]

const canvas = document.getElementById("experience-canvas")

const GRAVITY = 30
const CAPSULE_RADIUS = 0.35
const CAPSULE_HEIGHT = 1
const JUMP_HEIGHT = 10
const MOVE_SPEED = 5

let anushka = {
    instance: null,
    isMoving: false,
    spawnPosition: new THREE.Vector3()
}

let targetRotation = -Math.PI / 2

const colliderOctree = new Octree()
const playerCollider = new Capsule(
    new THREE.Vector3(0, CAPSULE_RADIUS, 0),
    new THREE.Vector3(0, CAPSULE_HEIGHT, 0),
    CAPSULE_RADIUS
)

let playerVelocity = new THREE.Vector3()
let playerOnFloor = false

const toast = document.getElementById("toast");
let toastTimeout;

function showToast(message) {
    clearTimeout(toastTimeout);

    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2000);
}


const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.6

const modalContent = {
    "project_1": { 
        title: "About Me", 
        content: "Hello! I'm Swayam Srivastava and I am an engineering student. I'm also a 3D designer and have been working on 3D softwares for years now. I also do video editing, UI/UX designing and animation (though I still love 3D the most). In my free time, I like to play video games and hang out with my friends. I absolutely LOVE eating nice food and also play a few musical instruments! This is the first website I ever made, marking the start of my web development journey. I'm gonna keep working on this site on the side and hopefully add a lot more fun stuff in the future while working on new projects which would also be displayed here! Reach out on any of my contacts if you wanna chat!" 
    },
    "project_2": { 
        title: "Skills and Experience", 
        content:`
    <strong>~SKILLS~</strong>
      <ul>
        <li>HTML, CSS, JavaScript, Three.Js, GSAP, Game Development, Git, Java, C, C++, Python.</li>
        <li>3D Designing, Graphic Designing, Sound Designing, Video Editing, Animation/Rigging, UI/UX Designing, Game Designing.</li>
      </ul>

    <strong>~TOOLS~</strong>
      <ul>
        <li>Blender, Davinci Resolve, Soundly, Figma, Adobe Illustrator, Visual Studio Code, Inkscape, Cavalry, Github, Unity.</li>
      </ul>
    <strong>~EXPERIENCE~</strong>
      <ul>
        <li>Designer in Association For Computing Machinery Chapter.</li>
        <li>Design for various ACM event websites and app.</li>
        <li>3D horror game made as summer project.</li>
      </ul>
    <strong>~LINKS~</strong>
    `,
        links:[
            {label: "Code2Create Website", url: "https://code2create.acmvit.in/"},
            {label: "CrypticHunt Website", url: "https://cryptichunt.acmvit.in/"},
            {label: "CrypticHunt App", url: "https://apps.apple.com/in/app/cryptic-hunt-by-acm-vit/id6686405189"}
        ]
    },
    "project_3": { 
        title: "Connect with me!", 
        content: "Here are some of my profiles!", 
        links: [
            { label: "LinkedIn", url: "https://www.linkedin.com/in/swayam-srivastava-3b6401326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
            { label: "GitHub", url: "https://github.com/XSomieX" },
            { label: "Instagram", url: "https://www.instagram.com/x_somie_x?igsh=MXF2c2k0aW93d2JnbQ%3D%3D&utm_source=qr" },
            { label: "Email", value: "swayam9891@gmail.com" }
        ]
    }
}; 

const modal = document.querySelector(".modal")
const modalTitle = document.querySelector(".modal-title")
const modalProjectDescription = document.querySelector(".modal-project-description")
const modalExitButton = document.querySelector(".modal-exit-button")

function showModal(id) {
    playClick(); 
    intersectObject = ""; 
    const content = modalContent[id];
    if (!content) return;

    modalTitle.textContent = content.title;
    modalProjectDescription.innerHTML = content.content;

document.querySelectorAll(".modal-project-visit-button").forEach(btn => btn.remove());

if (content.links && Array.isArray(content.links)) {
    content.links.forEach(linkData => {
        const btn = document.createElement("a");
        btn.textContent = linkData.label;
        btn.className = "modal-project-visit-button";

        if (linkData.label === "Email" && linkData.value) {
            btn.href = "#";

            btn.addEventListener("click", e => {
                e.preventDefault();

                navigator.clipboard.writeText(linkData.value)
                    .then(() => {
                        showToast("Email copied to clipboard!");
                    })
                    .catch(() => {
                        showToast("Failed to copy email");
                    });
            });

        }

        else if (linkData.url) {
            btn.href = linkData.url;
            btn.target = "_blank";
            btn.rel = "noopener noreferrer";
        }

        document.querySelector(".modal-content-wrapper").appendChild(btn);
    });
}
else if (content.link) {
    const btn = document.createElement("a");
    btn.textContent = "View Project";
    btn.href = content.link;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className = "modal-project-visit-button";
    document.querySelector(".modal-content-wrapper").appendChild(btn);
}
    modal.classList.remove("hidden");
}

function hideModal() {
    playClick()
    modal.classList.add("hidden")
}

function isModalVisible() {
    return !modal.classList.contains("hidden");
}

modal.addEventListener("pointerdown", e => e.stopPropagation());

modalExitButton.addEventListener("click", hideModal)

loader.load("./Portfolio2.glb", (glb) => {
    glb.scene.traverse(child => {
        if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
        }

        if (child.isMesh && intersectObjectsNames.includes(child.parent?.name)) {
            intersectObjects.push(child)
        }

        if (child.name === "Anushka") {
            anushka.spawnPosition.copy(child.position)
            anushka.instance = child
            playerCollider.start.copy(child.position).add(new THREE.Vector3(0, CAPSULE_RADIUS, 0))
            playerCollider.end.copy(child.position).add(new THREE.Vector3(0, CAPSULE_HEIGHT, 0))
        }

        if (child.name === "Ground_Collider") {
            colliderOctree.fromGraphNode(child)
            child.visible = false
        }
    })

    scene.add(glb.scene)
})

const sun = new THREE.DirectionalLight(0xffffff, 1.2)
sun.position.set(15, 50, -10)
sun.castShadow = true
sun.shadow.mapSize.width = 4096
sun.shadow.mapSize.height = 4096
sun.shadow.camera.left = -100
sun.shadow.camera.right = 100
sun.shadow.camera.top = 100
sun.shadow.camera.bottom = -100
sun.shadow.normalBias = 0.9
scene.add(sun)

const ambient = new THREE.AmbientLight(0x404040, 3)
scene.add(ambient)

let transition = 0

const daySunColor = new THREE.Color(0xffffff)
const nightSunColor = new THREE.Color("#2a3cff")

const dayAmbientColor = new THREE.Color(0x404040)
const nightAmbientColor = new THREE.Color("#1a2f66")

const daySunIntensity = 1.2
const nightSunIntensity = 0.7

const dayAmbientIntensity = 3
const nightAmbientIntensity = 1.4

const aspect = window.innerWidth / window.innerHeight
const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000)
camera.position.set(-50, 100, 200)
camera.zoom = 3.2
camera.updateProjectionMatrix()
scene.add(camera)

const cameraOffset = new THREE.Vector3(-62, 67, -100)

function shortestAngle(from, to) {
    let delta = (to - from) % (Math.PI * 2)
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2
    return from + delta
}

function playerCollisions() {
    const result = colliderOctree.capsuleIntersect(playerCollider)
    playerOnFloor = false

    if (result) {
        playerOnFloor = result.normal.y > 0
        playerCollider.translate(result.normal.multiplyScalar(result.depth))

        if (playerOnFloor) {
            anushka.isMoving = false
            playerVelocity.set(0, 0, 0)
        }
    }
}

function updatePlayer() {
    if (!anushka.instance) return
    if (!playerOnFloor) playerVelocity.y -= GRAVITY * 0.035

    playerCollider.translate(playerVelocity.clone().multiplyScalar(0.035))
    playerCollisions()

    anushka.instance.position.copy(playerCollider.start)
    anushka.instance.position.y -= CAPSULE_RADIUS

    const desired = shortestAngle(anushka.instance.rotation.y, targetRotation)
    anushka.instance.rotation.y = THREE.MathUtils.lerp(anushka.instance.rotation.y, desired, 0.3)
}

function onKeyDown(e) {
    if (anushka.isMoving) return;

    switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
            hopSound.currentTime = 0;
            hopSound.play().catch(() => {});
            playerVelocity.z += MOVE_SPEED;
            targetRotation = Math.PI;
            break;

        case "s":
        case "arrowdown":
            hopSound.currentTime = 0;
            hopSound.play().catch(() => {});
            playerVelocity.z -= MOVE_SPEED;
            targetRotation = 0;
            break;

        case "a":
        case "arrowleft":
            hopSound.currentTime = 0;
            hopSound.play().catch(() => {});
            playerVelocity.x += MOVE_SPEED;
            targetRotation = -Math.PI / 2;
            break;

        case "d":
        case "arrowright":
            hopSound.currentTime = 0;
            hopSound.play().catch(() => {});
            playerVelocity.x -= MOVE_SPEED;
            targetRotation = Math.PI / 2;
            break;

        default:
            return; 
    }

    playerVelocity.y = JUMP_HEIGHT;
    anushka.isMoving = true;
}

function movePlayer(direction) {
    if (anushka.isMoving || isModalVisible()) return;

    hopSound.currentTime = 0;
    hopSound.play().catch(() => {});

    switch (direction) {
        case "up":
            playerVelocity.z += MOVE_SPEED;
            targetRotation = Math.PI;
            break;
        case "down":
            playerVelocity.z -= MOVE_SPEED;
            targetRotation = 0;
            break;
        case "left":
            playerVelocity.x += MOVE_SPEED;
            targetRotation = -Math.PI / 2;
            break;
        case "right":
            playerVelocity.x -= MOVE_SPEED;
            targetRotation = Math.PI / 2;
            break;
        default:
            return;
    }

    playerVelocity.y = JUMP_HEIGHT;
    anushka.isMoving = true;
}

document.querySelectorAll("#mobile-controls button").forEach(btn => {
  ["touchstart", "mousedown"].forEach(evt => {
    btn.addEventListener(evt, e => {
      e.preventDefault();
      movePlayer(btn.dataset.dir);
    });
  });
});

window.addEventListener("keydown", onKeyDown)

window.addEventListener("pointermove", e => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
})

window.addEventListener("pointerdown", (e) => {
    if (isModalVisible()) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(intersectObjects);

    if (hits.length > 0) {
        const id = hits[0].object.parent.name;
        showModal(id);
    }
});

function updateLighting() {
    const target = isNight ? 1 : 0
    transition += (target - transition) * 0.05

    sun.color.copy(daySunColor).lerp(nightSunColor, transition)
    ambient.color.copy(dayAmbientColor).lerp(nightAmbientColor, transition)

    sun.intensity = THREE.MathUtils.lerp(daySunIntensity, nightSunIntensity, transition)
    ambient.intensity = THREE.MathUtils.lerp(dayAmbientIntensity, nightAmbientIntensity, transition)
}

function animate() {
    updatePlayer()
    updateLighting()

    if (anushka.instance) {
        const camPos = new THREE.Vector3(
            anushka.instance.position.x + cameraOffset.x,
            cameraOffset.y,
            anushka.instance.position.z + cameraOffset.z
        )

        camera.position.copy(camPos)
        camera.lookAt(
            anushka.instance.position.x,
            camera.position.y - 65,
            anushka.instance.position.z
        )
    }

    if (isModalVisible()) {
        document.body.style.cursor = "default"
        intersectObject = ""
    } else {
        raycaster.setFromCamera(pointer, camera)
        const hits = raycaster.intersectObjects(intersectObjects)

        if (hits.length > 0) {
            document.body.style.cursor = "pointer"
            intersectObject = hits[0].object.parent.name
        } else {
            document.body.style.cursor = "default"
            intersectObject = ""
        }
    }

    renderer.render(scene, camera)
}
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const aspect = width / height;
    camera.left = -aspect * 50;
    camera.right = aspect * 50;
    camera.top = 50;
    camera.bottom = -50;
    camera.updateProjectionMatrix();
});


renderer.setAnimationLoop(animate)


