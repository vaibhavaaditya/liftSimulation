const submit_btn_lft = document.getElementById('submit_lift');

submit_btn_lft.addEventListener('click', () =>{
    let num_floors = parseInt(document.getElementById('num_floors').value, 10);
    let num_lifts = parseInt(document.getElementById('num_lifts').value, 10);
    generate_grid(num_floors, num_lifts);
    window.scrollTo(0, document.body.scrollHeight);
    
});


function generate_grid(num_floors, num_lifts){

    const building_div = document.getElementById('building');
    console.log(num_floors);
    console.log(num_lifts);
    building_div.innerHTML = '';
    console.log('inside da function');
    const floor_clr = '#fbe9b8';
    
    for (let i=0; i<num_floors; i++){

        let grid_item = document.createElement('div');
        let floor_title = document.createElement('div');
        let floor_btn_container = document.createElement('div');
        let floor_up_btn = document.createElement('button');
        let floor_down_btn = document.createElement('button');

        floor_title.textContent = `Floor ${num_floors-i}`;
        floor_title.alignSelf = 'center';
        floor_title.style.marginRight = '20px';

                
        floor_up_btn.className = 'floor_btn';
        floor_up_btn.id = `floor_up_btn_${num_floors-i}`;
        floor_up_btn.textContent = '🔼';
        floor_up_btn.style.display = 'flex';
        floor_up_btn.style.justifyContent = 'center';
        floor_up_btn.style.textAlign = 'center';
        floor_up_btn.style.alignSelf = 'center';
        floor_up_btn.style.fontSize = '18px';
        floor_up_btn.style.padding = '10px';

        floor_down_btn.className = 'floor_btn';
        floor_down_btn.id = `floor_down_btn_${num_floors-i}`;
        floor_down_btn.textContent = '🔽';
        floor_down_btn.style.display = 'flex';
        floor_down_btn.style.justifyContent = 'center';
        floor_down_btn.style.textAlign = 'center';
        floor_down_btn.style.alignSelf = 'center';
        floor_down_btn.style.fontSize = '18px';
        floor_down_btn.style.padding = '10px';
        

        floor_btn_container.appendChild(floor_up_btn);
        floor_btn_container.appendChild(floor_down_btn);
        floor_btn_container.style.display = 'flex';
        floor_btn_container.style.flexDirection = 'column';
        floor_btn_container.style.gap = '10px';
        
        grid_item.appendChild(floor_title);
        grid_item.appendChild(floor_btn_container);
        
        grid_item.style.display = 'flex';
        grid_item.className = 'floor';
        grid_item.id = `floor_${num_floors-i}`;
        grid_item.style.padding = '15px';
        grid_item.style.width = `${Math.max(num_lifts*200, 800)}px`;
        grid_item.style.height = '180px';
        grid_item.style.backgroundColor = floor_clr;
        grid_item.style.borderTop = '10px solid #444444';
        grid_item.style.borderRadius = '2px';

        grid_item.justifyContent = 'flex-end';
        
        building_div.appendChild(grid_item);

    }

    for(let j=0; j<num_lifts; j++){
        let lift_box = document.createElement('div');
        let lift_box_right_door = document.createElement('div');
        let lift_box_left_door = document.createElement('div');

        lift_box.id = `lift_box_${j+1}`;
        lift_box.style.backgroundColor = 'black';
        lift_box.style.width = '100px';
        lift_box.style.height = '150px';
        lift_box.style.display = 'inline-block';
        lift_box.style.margin = '0px 15px';
        lift_box.style.display = 'flex';
        lift_box.style.border = '1px solid black';
        
        lift_box_left_door.textContent = `${j+1}`;
        lift_box_left_door.style.width = '30px';
        lift_box_left_door.style.color = 'white';
        lift_box_left_door.style.height = '130px';
        lift_box_left_door.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        lift_box_left_door.style.border = '10px solid #d1d1d1';
        lift_box_left_door.style.borderImage = 'linear-gradient(to right, grey, darkgrey) 1';
        lift_box_right_door.style.borderImage = 'radial-gradient(circle, grey, darkgrey) 1';
        lift_box_left_door.style.display = 'flex';
        lift_box_left_door.style.justifyContent = 'center';
        lift_box_left_door.style.alignItems = 'center';

        lift_box_right_door.textContent = `${j+1}`;
        lift_box_right_door.style.color = 'white';
        lift_box_right_door.style.width = '30px';
        lift_box_right_door.style.height = '130px';
        lift_box_right_door.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        lift_box_right_door.style.border = '10px solid #d1d1d1';
        lift_box_right_door.style.borderImage = 'radial-gradient(circle, grey, darkgrey) 1';
        lift_box_right_door.style.display = 'flex';
        lift_box_right_door.style.justifyContent = 'center';
        lift_box_right_door.style.alignItems = 'center';

        lift_box.appendChild(lift_box_left_door);
        lift_box.appendChild(lift_box_right_door);
        const first_floor = document.getElementById('floor_1');
        first_floor.appendChild(lift_box);
    }

}


document.getElementById('building').addEventListener('click', function (event) {
    if (event.target && event.target.classList.contains('floor_btn')) {
        const buttonId = event.target.id;

        const btn_press_info = buttonId.split('_');
        const targetFloor = parseInt(btn_press_info[3], 10);
        moveElevatorToFloor(targetFloor);
    }
});


function moveElevatorToFloor(targetFloor) {
    console.log(`Moving elevator to floor ${targetFloor}`);
    const floorHeight = 220; 
    const targetPosition = (targetFloor - 1) * floorHeight;
    let lift_ref = document.getElementById('lift_box_1');

    const timeToMove = Math.abs(targetFloor - 1) * 2;
    lift_ref.style.transition = `transform ${timeToMove}s ease-in-out`;
    lift_ref.style.transform = `translateY(-${targetPosition}px)`;
    setTimeout(openDoors, timeToMove * 1000);
    window.scrollTo(0, lift_ref.divPosition - windowHeight / 2);
}

function openDoors() {
    const lift_door_ref = document.getElementById('lift_box_1');
    lift_door_ref.style.overflow = 'hidden';
    const doors = lift_door_ref.children; 
    const leftDoor = doors[0]; 
    const rightDoor = doors[1]; 

    leftDoor.style.transition = 'transform 2.5s ease-in-out';
    rightDoor.style.transition = 'transform 2.5s ease-in-out';
     
    leftDoor.style.transform = `translateX(-100%)`;
    rightDoor.style.transform = `translateX(100%)`;

    setTimeout(() => {
        closeDoors();
    }, 2500);
}


function closeDoors() {
    const lift_door_ref = document.getElementById('lift_box_1');
    const doors = lift_door_ref.children; 
    const leftDoor = doors[0];
    const rightDoor = doors[1]; 

    leftDoor.style.transition = 'transform 2.5s ease-in-out';
    rightDoor.style.transition = 'transform 2.5s ease-in-out';
     
    leftDoor.style.transform = `translateX(0%)`;
    rightDoor.style.transform = `translateX(0%)`;
}