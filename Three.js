<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Умная вселенная</title>
<style>
  body { margin: 0; overflow: hidden; }
  canvas { display: block; }
</style>
</head>
<body>
<script src="https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"></script>
<script>
// Инициализация сцены
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Камера
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 20000);
camera.position.z = 1000;

// Рендерер
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Обработка ресайза
window.addEventListener('resize', () => {
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Создаем миллионы звезд
const starCount = 30000; // Можно увеличить при мощном железе
const starsGeometry = new THREE.BufferGeometry();
const positions = [];
const colors = [];

for(let i=0; i<starCount; i++){
    const x=(Math.random()-0.5)*20000;
    const y=(Math.random()-0.5)*20000;
    const z=(Math.random()-0.5)*20000;
    positions.push(x,y,z);

    // Цвет звезд - чуть голубой или белый
    const color=new THREE.Color(1,1,1);
    colors.push(color.r,color.g,color.b);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));

const starsMaterial=new THREE.PointsMaterial({ size:1.2, vertexColors:true });
const starPoints=new THREE.Points(starsGeometry, starsMaterial);
scene.add(starPoints);

// Создаем галактики (группы звезд)
const galaxyCount=50;
const galaxies=[];

for(let g=0; g<galaxyCount; g++){
    const galaxyGroup=new THREE.Group();
    const centerX=(Math.random()-0.5)*15000;
    const centerY=(Math.random()-0.5)*15000;
    const centerZ=(Math.random()-0.5)*15000;

    for(let i=0;i<100;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*300+50;
        const x=Math.cos(angle)*radius+centerX;
        const y=Math.sin(angle)*radius+centerY;
        const z=(Math.random()-0.5)*100;

        const starGeo=new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute([x,y,z],3));
        const starMat=new THREE.PointsMaterial({ size:2+Math.random()*2,color:0xffffff });
        const star=new THREE.Points(starGeo,starMat);
        galaxyGroup.add(star);
    }
    scene.add(galaxyGroup);
    galaxies.push(galaxyGroup);
}

// Обработка мыши для вращения камеры
let isDragging=false;
let previousMousePosition={x:0,y:0};

document.addEventListener('mousedown', ()=>{isDragging=true});
document.addEventListener('mouseup', ()=>{isDragging=false});
document.addEventListener('mousemove', e => {
    if(isDragging){
        const deltaX=e.clientX - previousMousePosition.x;
        const deltaY=e.clientY - previousMousePosition.y;

        scene.rotation.y += deltaX*0.005;
        scene.rotation.x += deltaY*0.005;

        previousMousePosition.x=e.clientX;
        previousMousePosition.y=e.clientY;
    }
});

// Зум колесиком
document.addEventListener('wheel', e => {
    camera.position.z+=e.deltaY*0.5;
});

// Для интерактивности — Raycaster для определения объектов под курсором
const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();

let hoveredObject=null;

// Обработка наведения мыши
window.addEventListener('mousemove', e => {
    mouse.x=(e.clientX / window.innerWidth)*2-1;
    mouse.y= - (e.clientY / window.innerHeight)*2+1;
});

// Создаем массив всех звезд для поиска ближайших при наведении
const allStars=[];
// Заполняем массив из всех звездных объектов (из галактик)
galaxies.forEach(group => {
    group.children.forEach(star => {
        allStars.push(star);
    });
});

// Функция подсветки ближайших звезд при наведении
function highlightNearestStars() {
    raycaster.setFromCamera(mouse,camera);
    const intersects=raycaster.intersectObjects(allStars);

    if(intersects.length>0){
        // Очищаем предыдущие подсветки
        if(hoveredObject && hoveredObject.material.originalColor){
            hoveredObject.material.color.copy(hoveredObject.material.originalColor);
        }

        // Подсвечиваем ближайшую звезду
        hoveredObject=intersects[0].object;
        if(!hoveredObject.material.originalColor){
            hoveredObject.material.originalColor=hoveredObject.material.color.clone();
        }
        hoveredObject.material.color.set(0xff0000); // красный цвет при наведении
    } else {
        // Нет пересечений — возвращаем цвет предыдущей подсвеченной звезде
        if(hoveredObject && hoveredObject.material.originalColor){
            hoveredObject.material.color.copy(hoveredObject.material.originalColor);
            hoveredObject=null;
        }
    }
}

// Обработка клика — добавление новой галактики в место клика
window.addEventListener('click', e => {
    // Создаем новую галактику в месте клика (по лучу)
    raycaster.setFromCamera(mouse,camera);
    const intersects=raycaster.intersectObjects([starPoints]);
    
    // Можно просто добавить новую галактику в случайной точке или в месте пересечения с землей/объектом.
    
    // Для простоты — создадим новую галактику в случайной точке поблизости:
    
    const centerX=(Math.random()-0.5)*15000 + (mouse.x*10000);
    const centerY=(Math.random()-0.5)*15000 + (mouse.y*10000);
    const centerZ=(Math.random()-0.5)*15000;

    const newGalaxy=new THREE.Group();
    
    for(let i=0;i<100;i++){
        const angle=Math.random()*Math.PI*2;
        const radius=Math.random()*300+50;
        const x=Math.cos(angle)*radius+centerX;
        const y=Math.sin(angle)*radius+centerY;
        const z=(Math.random()-0.5)*100;

        const starGeo=new THREE.BufferGeometry();
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute([x,y,z],3));
        
        // Цвет случайный или белый
        const color=new THREE.Color(Math.random(), Math.random(), Math.random());
        
        const starMat=new THREE.PointsMaterial({ size:2+Math.random()*2,color:color });
        
        // Для возможности подсветки сохраняем оригинальный цвет как свойство объекта
        starMat.originalColor=color.clone();

        const star=new THREE.Points(starGeo,starMat);
        
        newGalaxy.add(star);
    }
    
    scene.add(newGalaxy);
}

// Анимация и обновление сцены
function animate() {
    requestAnimationFrame(animate);

    highlightNearestStars();

    renderer.render(scene,camera);
}
animate();

</script>
</body>
</html>
