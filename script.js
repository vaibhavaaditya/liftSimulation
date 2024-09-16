class Lift {
    constructor(id, building) {
        this.id = id;
        this.currentFloor = 1;
        this.isMoving = false;
        this.isBusy = false;
        this.building = building;
        this.isOpen = false;
        this.requestQueue = [];
        this.element = this.createLiftElement();
    }

    createLiftElement() {
        const liftBox = document.createElement('div');
        liftBox.id = `lift_box_${this.id}`;
        liftBox.classList.add('liftBox');

        const leftDoor = document.createElement('div');
        const rightDoor = document.createElement('div');
        
        leftDoor.textContent = `${this.id}`;
        leftDoor.classList.add('left_door');        
        
        rightDoor.textContent = `${this.id}`;
        rightDoor.classList.add('right_door');
        
        liftBox.appendChild(leftDoor);
        liftBox.appendChild(rightDoor);

        return liftBox;
    }

    moveToFloor(targetFloor, floorHeight) {
        if (this.isMoving || this.isOpen) return;

        this.isMoving = true;
        this.isBusy = true;
        const timeToMove = Math.abs(this.currentFloor - targetFloor) * 2;
        const targetPosition = (targetFloor - 1) * floorHeight;

        this.element.style.transition = `transform ${timeToMove}s ease-in-out`;
        this.element.style.transform = `translateY(-${targetPosition}px)`;

        setTimeout(() => {
            this.currentFloor = targetFloor;
            this.isMoving = false;
            this.openDoors();
        }, timeToMove * 1000);
    }

    openDoors() {
        if (this.isOpen) return;

        const [leftDoor, rightDoor] = this.element.children;
        leftDoor.style.transform = 'translateX(-100%)';
        rightDoor.style.transform = 'translateX(100%)';
        this.isOpen = true;

        setTimeout(() => this.closeDoors(), 2500);
    }

    closeDoors() {
        const [leftDoor, rightDoor] = this.element.children;
        leftDoor.style.transform = 'translateX(0%)';
        rightDoor.style.transform = 'translateX(0%)';
        this.isOpen = false;

        setTimeout(() => {
            this.isMoving = false;
            this.isBusy = false;
            this.processNextRequest();
            this.building.liftArrivedAtFloor(this.currentFloor);
        }, 2500);
    }

    addRequest(floor) {
        if (!this.requestQueue.includes(floor)) {
            this.requestQueue.push(floor);
        }
        if (!this.isMoving && !this.isOpen) {
            this.processNextRequest();
        }
    }

    processNextRequest() {
        if (this.requestQueue.length > 0 && !this.isMoving && !this.isOpen && !this.isBusy) {
            const nextFloor = this.requestQueue.shift();
            if (nextFloor !== this.currentFloor) {
                this.moveToFloor(nextFloor, 220);
            } else {
                this.openDoors();
            }
        }
    }
}


class Building {
    constructor(num_floors, num_lifts) {
        this.num_floors = num_floors;
        this.num_lifts = num_lifts;
        this.floors = [];
        this.lifts = [];
        this.buildingDiv = document.getElementById('building');
        this.floorRequests = new Map();
        this.init();
    }

    init() {
        this.generateFloors();
        this.generateLifts();
    }


    generateFloors() {
        this.buildingDiv.innerHTML = '';
        for (let i = this.num_floors; i > 0; i--) {
            const floorDiv = document.createElement('div');
            floorDiv.className = 'floor';
            floorDiv.id = `floor_${i}`;
            floorDiv.style.width = `${Math.max(this.num_lifts * 200, 800)}px`;
            
            const floorLabel = document.createElement('div');
            floorLabel.textContent = `Floor ${i}`;
            floorLabel.classList.add('floor_label');
            floorDiv.appendChild(floorLabel);

            const buttonContainer = this.createButtonContainer(i);
            buttonContainer.style.alignSelf = 'center';
            floorDiv.appendChild(buttonContainer);

            this.buildingDiv.appendChild(floorDiv);
            this.floors.push(floorDiv);
        }
    }    
    
    createButtonContainer(floor) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.margin = 'auto 10px';

        const upButton = document.createElement('button');
        upButton.textContent = '🔼';
        upButton.className = 'floor_btn';
        upButton.id = `floor_up_btn_${floor}`;
        upButton.hidden = (floor === this.num_floors);
        upButton.addEventListener('click', () => this.requestLift(floor, 'up'));

        const downButton = document.createElement('button');
        downButton.textContent = '🔽';
        downButton.className = 'floor_btn';
        downButton.id = `floor_down_btn_${floor}`;
        downButton.hidden = (floor === 1);
        downButton.addEventListener('click', () => this.requestLift(floor, 'down'));

        if (this.num_lifts !== 0) {
            buttonContainer.appendChild(upButton);
            buttonContainer.appendChild(downButton);
        }

        return buttonContainer;
    }

    generateLifts() {
        const firstFloor = document.getElementById('floor_1');

        for (let i = 0; i < this.num_lifts; i++) {
            const lift = new Lift(i + 1, this);
            firstFloor.appendChild(lift.element);
            this.lifts.push(lift);
        }
    }

    requestLift(floor, direction) {
        const button = document.getElementById(`floor_${direction}_btn_${floor}`);
        button.disabled = true;
        button.style.border = '2px solid yellow';

        if (!this.floorRequests.has(floor)) {
            this.floorRequests.set(floor, new Set([direction]));
        } else {
            this.floorRequests.get(floor).add(direction);
        }

        const availableLift = this.findNearestAvailableLift(floor);
        if (availableLift) {
            availableLift.addRequest(floor);
        } else {
            const nearestLift = this.findNearestLift(floor);
            nearestLift.addRequest(floor);
        }
    }

    liftArrivedAtFloor(floor) {
        if (this.floorRequests.has(floor)) {
            const directions = this.floorRequests.get(floor);
            for (const direction of directions) {
                this.enableButton(floor, direction);
            }
            this.floorRequests.delete(floor);
        }
    }

    enableButton(floor, direction) {
        const button = document.getElementById(`floor_${direction}_btn_${floor}`);
        if (button) {
            button.disabled = false;
            button.style.border = '';
        }
    }

    findNearestAvailableLift(requestedFloor) {
        return this.lifts.reduce((nearest, lift) => {
            if (!lift.isMoving && !lift.isOpen && lift.requestQueue.length === 0) {
                const distance = Math.abs(lift.currentFloor - requestedFloor);
                if (!nearest || distance < Math.abs(nearest.currentFloor - requestedFloor)) {
                    return lift;
                }
            }
            return nearest;
        }, null);
    }

    findNearestLift(requestedFloor) {
        return this.lifts.reduce((nearest, lift) => {
            const distance = Math.abs(lift.currentFloor - requestedFloor);
            if (!nearest || distance < Math.abs(nearest.currentFloor - requestedFloor)) {
                return lift;
            }
            return nearest;
        }, null);
    }
}

document.getElementById('submit_lift').addEventListener('click', () => {
    const num_floors_value = document.getElementById('num_floors').value ;
    const num_lifts_value = document.getElementById('num_lifts').value ;
    const num_floors = parseInt(document.getElementById('num_floors').value, 10);
    const num_lifts = parseInt(document.getElementById('num_lifts').value, 10);
    const building_parent = document.getElementById('building_parent');
    const error_invalid_input = document.getElementById("form_input_cmts");
    
    console.log(num_floors);
    console.log(num_lifts);
    console.log(typeof(num_floors));

    if (num_floors <= 0 || num_lifts < 0 || isNaN(num_floors) || isNaN(num_lifts) || !(!isNaN(num_floors_value) && Number.isInteger(Number(num_floors_value))) || !(!isNaN(num_lifts_value) && Number.isInteger(Number(num_lifts_value)))) {
        error_invalid_input.innerHTML = '⚠️⚠️fix the input pls⚠️⚠️ <br> (enter integer value: number of floors >=1; num_lifts >=0)';
        error_invalid_input.style.textAlign = 'center';
        error_invalid_input.classList.add('input_error');
        building_parent.hidden = true;
    } else {
        error_invalid_input.textContent = '';
        building_parent.hidden = false;
        new Building(num_floors, num_lifts);
        window.scrollTo(0, document.body.scrollHeight);
    }
});






















//this below code is more of a functional approach 
//oop based approach has been favoured due to easy maintability and comprehension

// const submit_btn_lft = document.getElementById('submit_lift');

// submit_btn_lft.addEventListener('click', () =>{
//     let num_floors = parseInt(document.getElementById('num_floors').value, 10);
//     let num_lifts = parseInt(document.getElementById('num_lifts').value, 10);
//     generate_grid(num_floors, num_lifts);
//     window.scrollTo(0, document.body.scrollHeight);
    
// });


// function generate_grid(num_floors, num_lifts){

//     const building_div = document.getElementById('building');
//     console.log(num_floors);
//     console.log(num_lifts);
//     building_div.innerHTML = '';
//     console.log('inside da function');
//     const floor_clr = '#fbe9b8';
    
//     for (let i=0; i<num_floors; i++){

//         let grid_item = document.createElement('div');
//         let floor_title = document.createElement('div');
//         let floor_btn_container = document.createElement('div');
//         let floor_up_btn = document.createElement('button');
//         let floor_down_btn = document.createElement('button');

//         floor_title.textContent = `Floor ${num_floors-i}`;
//         floor_title.alignSelf = 'center';
//         floor_title.style.marginRight = '20px';

                
//         floor_up_btn.className = 'floor_btn';
//         floor_up_btn.id = `floor_up_btn_${num_floors-i}`;
//         floor_up_btn.textContent = '🔼';
//         floor_up_btn.style.display = 'flex';
//         floor_up_btn.style.justifyContent = 'center';
//         floor_up_btn.style.textAlign = 'center';
//         floor_up_btn.style.alignSelf = 'center';
//         floor_up_btn.style.fontSize = '18px';
//         floor_up_btn.style.padding = '10px';

//         floor_down_btn.className = 'floor_btn';
//         floor_down_btn.id = `floor_down_btn_${num_floors-i}`;
//         floor_down_btn.textContent = '🔽';
//         floor_down_btn.style.display = 'flex';
//         floor_down_btn.style.justifyContent = 'center';
//         floor_down_btn.style.textAlign = 'center';
//         floor_down_btn.style.alignSelf = 'center';
//         floor_down_btn.style.fontSize = '18px';
//         floor_down_btn.style.padding = '10px';
        

//         floor_btn_container.appendChild(floor_up_btn);
//         floor_btn_container.appendChild(floor_down_btn);
//         floor_btn_container.style.display = 'flex';
//         floor_btn_container.style.flexDirection = 'column';
//         floor_btn_container.style.gap = '10px';
        
//         grid_item.appendChild(floor_title);
//         grid_item.appendChild(floor_btn_container);
        
//         grid_item.style.display = 'flex';
//         grid_item.className = 'floor';
//         grid_item.id = `floor_${num_floors-i}`;
//         grid_item.style.padding = '15px';
//         grid_item.style.width = `${Math.max(num_lifts*200, 800)}px`;
//         grid_item.style.height = '180px';
//         grid_item.style.backgroundColor = floor_clr;
//         grid_item.style.borderTop = '10px solid #444444';
//         grid_item.style.borderRadius = '2px';

//         grid_item.justifyContent = 'flex-end';
        
//         building_div.appendChild(grid_item);

//     }

//     for(let j=0; j<num_lifts; j++){
//         let lift_box = document.createElement('div');
//         let lift_box_right_door = document.createElement('div');
//         let lift_box_left_door = document.createElement('div');

//         lift_box.id = `lift_box_${j+1}`;
//         lift_box.style.backgroundColor = 'black';
//         lift_box.style.width = '100px';
//         lift_box.style.height = '150px';
//         lift_box.style.display = 'inline-block';
//         lift_box.style.margin = '0px 15px';
//         lift_box.style.display = 'flex';
//         lift_box.style.border = '1px solid black';
        
//         lift_box_left_door.textContent = `${j+1}`;
//         lift_box_left_door.style.width = '30px';
//         lift_box_left_door.style.color = 'white';
//         lift_box_left_door.style.height = '130px';
//         lift_box_left_door.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
//         lift_box_left_door.style.border = '10px solid #d1d1d1';
//         lift_box_left_door.style.borderImage = 'linear-gradient(to right, grey, darkgrey) 1';
//         lift_box_right_door.style.borderImage = 'radial-gradient(circle, grey, darkgrey) 1';
//         lift_box_left_door.style.display = 'flex';
//         lift_box_left_door.style.justifyContent = 'center';
//         lift_box_left_door.style.alignItems = 'center';

//         lift_box_right_door.textContent = `${j+1}`;
//         lift_box_right_door.style.color = 'white';
//         lift_box_right_door.style.width = '30px';
//         lift_box_right_door.style.height = '130px';
//         lift_box_right_door.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
//         lift_box_right_door.style.border = '10px solid #d1d1d1';
//         lift_box_right_door.style.borderImage = 'radial-gradient(circle, grey, darkgrey) 1';
//         lift_box_right_door.style.display = 'flex';
//         lift_box_right_door.style.justifyContent = 'center';
//         lift_box_right_door.style.alignItems = 'center';

//         lift_box.appendChild(lift_box_left_door);
//         lift_box.appendChild(lift_box_right_door);
//         const first_floor = document.getElementById('floor_1');
//         first_floor.appendChild(lift_box);
//     }

// }


// document.getElementById('building').addEventListener('click', function (event) {
//     if (event.target && event.target.classList.contains('floor_btn')) {
//         const buttonId = event.target.id;

//         const btn_press_info = buttonId.split('_');
//         const targetFloor = parseInt(btn_press_info[3], 10);
//         moveElevatorToFloor(targetFloor);
//     }
// });


// function moveElevatorToFloor(targetFloor) {
//     console.log(`Moving elevator to floor ${targetFloor}`);
//     const floorHeight = 220; 
//     const targetPosition = (targetFloor - 1) * floorHeight;
//     let lift_ref = document.getElementById('lift_box_1');

//     const timeToMove = Math.abs(targetFloor - 1) * 2;
//     lift_ref.style.transition = `transform ${timeToMove}s ease-in-out`;
//     lift_ref.style.transform = `translateY(-${targetPosition}px)`;
//     setTimeout(openDoors, timeToMove * 1000);
//     window.scrollTo(0, lift_ref.divPosition - windowHeight / 2);
// }

// function openDoors() {
//     const lift_door_ref = document.getElementById('lift_box_1');
//     lift_door_ref.style.overflow = 'hidden';
//     const doors = lift_door_ref.children; 
//     const leftDoor = doors[0]; 
//     const rightDoor = doors[1]; 

//     leftDoor.style.transition = 'transform 2.5s ease-in-out';
//     rightDoor.style.transition = 'transform 2.5s ease-in-out';
     
//     leftDoor.style.transform = `translateX(-100%)`;
//     rightDoor.style.transform = `translateX(100%)`;

//     setTimeout(() => {
//         closeDoors();
//     }, 2500);
// }


// function closeDoors() {
//     const lift_door_ref = document.getElementById('lift_box_1');
//     const doors = lift_door_ref.children; 
//     const leftDoor = doors[0];
//     const rightDoor = doors[1]; 

//     leftDoor.style.transition = 'transform 2.5s ease-in-out';
//     rightDoor.style.transition = 'transform 2.5s ease-in-out';
     
//     leftDoor.style.transform = `translateX(0%)`;
//     rightDoor.style.transform = `translateX(0%)`;
// }