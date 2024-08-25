const submit_btn_lft = document.getElementById('submit_lift');

submit_btn_lft.addEventListener('click', () =>{
    let num_floors = parseInt(document.getElementById('num_floors').value, 10);
    let num_lifts = parseInt(document.getElementById('num_lifts').value, 10);
    generate_grid(num_floors, num_lifts);
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
        grid_item.style.display = 'flex';
        grid_item.className = 'floor';
        grid_item.id = `floor_${num_floors-i}`;
        grid_item.textContent = `Floor ${num_floors-i}`;
        grid_item.style.padding = '15px';
        grid_item.style.width = `${num_lifts*150}px`;
        grid_item.style.height = '100px';
        grid_item.style.backgroundColor = floor_clr;
        grid_item.style.margin = '10px';
        building_div.appendChild(grid_item);
    }

    for(let j=0; j<num_lifts; j++){
        let lift_box = document.createElement('div');
        lift_box.style.backgroundColor = 'black';
        lift_box.style.width = '100px';
        lift_box.style.height = '100px';
        lift_box.style.display = 'inline-block';
        lift_box.style.margin = '0px 10px';
        const first_floor = document.getElementById('floor_1');
        first_floor.appendChild(lift_box);
    }

}
