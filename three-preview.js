import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas=document.querySelector('#balcony3d'),status=document.querySelector('#previewStatus');
if(canvas){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#dce2df');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);let distance=8,azimuth=Math.PI/4,elevation=.43;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 scene.add(new THREE.HemisphereLight(0xffffff,0x87928f,2));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-4,8,6);scene.add(key);const fill=new THREE.DirectionalLight(0xffffff,1.2);fill.position.set(5,4,-5);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:0xdce2df,roughness:.92}));floor.rotation.x=-Math.PI/2;floor.position.y=-.035;scene.add(floor);
 const grid=new THREE.GridHelper(16,24,0xb6c0bc,0xcbd2cf);grid.position.y=-.025;scene.add(grid);
 const model=new THREE.Group();scene.add(model);let dragging=false,lastX=0,lastY=0,activePointerId=null;
 const metalColors={'Antrasit gri':'#3c4648','Eloksal gri':'#9ba09f','Siyah':'#252829','Beyaz':'#f3f1eb','Bronz':'#916947','Altınmeşe':'#a8783e'};
 const glassColors={'Şeffaf':'#c8e1e2','Füme':'#46565a','Bronz':'#b77c53','Yeşil':'#70a591','Mavi':'#77add0'};
 function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
 function cameraUpdate(){camera.position.set(distance*Math.sin(azimuth)*Math.cos(elevation),distance*Math.sin(elevation),distance*Math.cos(azimuth)*Math.cos(elevation));camera.lookAt(0,1,0)}
 function addBeam(a,b,y,material,thickness=.055){const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),m=new THREE.Mesh(new THREE.BoxGeometry(len,thickness,thickness),material);m.position.set((a.x+b.x)/2,y,(a.z+b.z)/2);m.rotation.y=-Math.atan2(dz,dx);model.add(m)}
 function updateModel(cfg){
  model.clear();const front=Math.max(2.4,Math.min(6,(cfg.width||4200)/1000)),depth=Math.max(1.15,Math.min(3.2,front*.43)),height=Math.max(1.2,Math.min(2.6,(cfg.height||1500)/1000));
  const half=front/2;let segments=[[{x:-half,z:0},{x:half,z:0}]];
  if(cfg.shape==='l')segments.push([{x:half,z:0},{x:half,z:-depth}]);
  if(cfg.shape==='u'){segments.push([{x:half,z:0},{x:half,z:-depth}]);segments.push([{x:-half,z:0},{x:-half,z:-depth}]);}
  if(cfg.shape==='angled'){const arm=depth*.92;segments[0]=[{x:-half,z:0},{x:0,z:0}];segments.push([{x:0,z:0},{x:arm*.707,z:-arm*.707}]);}
  const railMat=new THREE.MeshStandardMaterial({color:metalColors[cfg.frame]||'#3c4648',metalness:.68,roughness:.3});
  const paneMat=new THREE.MeshPhysicalMaterial({color:glassColors[cfg.glass]||'#c8e1e2',metalness:.06,roughness:.12,transparent:true,opacity:cfg.glass==='Şeffaf'?.34:.52,side:THREE.DoubleSide,depthWrite:false});
  const floorMat=new THREE.MeshStandardMaterial({color:'#c5cfcb',roughness:.76,metalness:.08});
  for(const [a,b] of segments){
   addBeam(a,b,.12,floorMat,.08);addBeam(a,b,height,railMat,.085);addBeam(a,b,.17,railMat,.065);
   const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),count=Math.max(1,Math.round((cfg.panels||4)*len/segments.reduce((s,[p,q])=>s+Math.hypot(q.x-p.x,q.z-p.z),0)));
   const posts=new Set([0,count]);for(let i=1;i<count;i++)posts.add(i);
   for(const i of posts){const t=i/count,p={x:a.x+dx*t,z:a.z+dz*t};const post=new THREE.Mesh(new THREE.BoxGeometry(.055,height-.1,.055),railMat);post.position.set(p.x,(height+.12)/2,p.z);model.add(post)}
   for(let i=0;i<count;i++){const t=(i+.5)/count,center={x:a.x+dx*t,z:a.z+dz*t},pane=new THREE.Mesh(new THREE.BoxGeometry(len/count*.92,height-.28,.024),paneMat);pane.position.set(center.x,(height+.12)/2,center.z);pane.rotation.y=-Math.atan2(dz,dx);model.add(pane)}
  }
  if(cfg.fixedTop||cfg.fixedBottom){for(const [a,b] of segments){const len=Math.hypot(b.x-a.x,b.z-a.z),dx=b.x-a.x,dz=b.z-a.z,y=cfg.fixedBottom?.42:height-.4;const sash=new THREE.Mesh(new THREE.BoxGeometry(len,.035,.035),railMat);sash.position.set((a.x+b.x)/2,y,(a.z+b.z)/2);sash.rotation.y=-Math.atan2(dz,dx);model.add(sash)}}
  model.rotation.y=0;cameraUpdate();
 }
 let current={shape:'straight',width:0,height:0,panels:4,glass:'Şeffaf',frame:'Antrasit gri'};
 window.addEventListener('balcony-config-change',e=>{current={...current,...e.detail};updateModel(current)});
 const stopDrag=()=>{dragging=false;activePointerId=null;canvas.classList.remove('dragging')};
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();dragging=true;activePointerId=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.classList.add('dragging');try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
 window.addEventListener('pointermove',e=>{if(!dragging||(activePointerId!==null&&e.pointerId!==activePointerId))return;e.preventDefault();azimuth-=(e.clientX-lastX)*.009;elevation=Math.max(.08,Math.min(1.05,elevation+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY;cameraUpdate()},{passive:false});
 const endDrag=e=>{if(activePointerId!==null&&e.pointerId!==undefined&&e.pointerId!==activePointerId)return;stopDrag()};window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',stopDrag);
 canvas.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(4,Math.min(13,distance+e.deltaY*.008));cameraUpdate()},{passive:false});
 document.querySelectorAll('.preview-controls [data-view]').forEach(button=>button.addEventListener('click',()=>{switch(button.dataset.view){case'left':azimuth+=.32;break;case'right':azimuth-=.32;break;case'zoom-in':distance=Math.max(4,distance-.8);break;case'zoom-out':distance=Math.min(13,distance+.8);break;case'reset':azimuth=Math.PI/4;elevation=.43;distance=8;break}cameraUpdate()}));
 new ResizeObserver(resize).observe(canvas.parentElement);resize();cameraUpdate();
 const animate=()=>{requestAnimationFrame(animate);renderer.render(scene,camera)};animate();
 if(status)status.remove();updateModel(current);
}
