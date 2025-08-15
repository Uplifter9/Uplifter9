// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Earth model
const geometry = new THREE.SphereGeometry(5, 32, 32);
const material = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('earth_day.jpg'),
});
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// Clouds
const cloudGeometry = new THREE.SphereGeometry(5.1, 32, 32);
const cloudMaterial = new THREE.MeshPhongMaterial({
    map: new THREE.TextureLoader().load('earth_clouds.jpg'),
    transparent: true,
    opacity: 0.5
});
const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

// Starfield
const starGeometry = new THREE.SphereGeometry(100, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('stars.jpg'),
    side: THREE.BackSide
});
const starfield = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starfield);

// Sun
const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(-15, 5, -5);
scene.add(sun);

// Lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-15, 5, -5);
scene.add(directionalLight);

// Camera position
camera.position.z = 10;

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 20;


// Time display
const infoDiv = document.getElementById('info');

function getCenterTimezone() {
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // The camera looks towards the negative Z axis.
    // We need to find the point on the sphere that the camera is looking at.
    // This is the intersection of the ray from the camera and the sphere.
    // However, a simpler approach for a fixed camera distance is to get the point opposite to the camera's position.
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    // The vector from the center of the earth to the camera is the camera's position, since the earth is at (0,0,0).
    const earthCenterToCamera = cameraPosition.clone();

    // The point on the surface of the earth that is in the center of the view is in the opposite direction of the camera.
    const centerPoint = earthCenterToCamera.clone().negate();

    // Convert this point to spherical coordinates to get latitude and longitude.
    const spherical = new THREE.Spherical().setFromVector3(centerPoint);
    const latitude = THREE.MathUtils.radToDeg(spherical.phi) - 90;
    const longitude = -THREE.MathUtils.radToDeg(spherical.theta);


    let timezone, time;
    try {
        timezone = tzlookup(latitude, longitude);
        time = moment().tz(timezone).format('HH:mm:ss');
    } catch (e) {
        timezone = "N/A";
        time = "N/A";
    }

    infoDiv.innerHTML = `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}<br>Timezone: ${timezone}<br>Time: ${time}`;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Auto-rotate the Earth
    // earth.rotation.y += 0.0005;
    clouds.rotation.y += 0.0001;


    getCenterTimezone();

    controls.update();

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
