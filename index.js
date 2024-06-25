/* Class is the blueprint. The constructor takes in the properties*/
class Room {
    constructor(id, name, area) {
        this.id = id;
        this.name = name;
        this.area = area;
    }
}

class House {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.rooms = [];
    }
   /* Methods are basicaly used as actions
   adds a new room to the House App. Isn't working. I couldn't figure out the bug in enought time.*/ 
    addRoom(name, area) {
        const roomId = this.rooms.length + 1;
        this.rooms.push(new Room(roomId, name, area)); /*.push adds a item to am array*/ 
    }
}
    /* This class used to interact with the server for CRUD operations */
class HouseService {
    static url = "http://localhost:3000/houses";
/* Static methods  Used to fetch all houses from the server*/ 
    static getAllHouses() {
        return $.get(this.url);
    }
/* Used to get houses by id*/ 
    static getHouse(id) {
        return $.get(`${this.url}/${id}`);
    }
/*Sends a request to create a house. This works*/ 
    static createHouse(house) {
        return $.ajax({
            url: this.url,
            type: 'POST',
            data: JSON.stringify(house),
            contentType: 'application/json'
        });
    }

    static updateHouse(house) {
        return $.ajax({
            url: `${this.url}/${house.id}`,
            type: 'PUT',
            data: JSON.stringify(house),
            contentType: 'application/json'
        });
    }

    static deleteHouse(id) {
        return $.ajax({
            url: `${this.url}/${id}`,
            type: 'DELETE'
        });
    }
}
/**
 * Manages the DOM
 */
class DOMManager {
    static houses;

    static getAllHouses() {
        HouseService.getAllHouses().then(houses => this.render(houses));
    }

    static createHouse(name) {
        if (!name) {
            alert('Please enter a house name.');
            return;
        }
        
        const houseId = this.houses ? this.houses.length + 1 : 1;
        const newHouse = new House(houseId, name);

        HouseService.createHouse(newHouse)
            .then(() => HouseService.getAllHouses())
            .then(houses => this.render(houses));
    }

    static deleteHouse(id) {
        HouseService.deleteHouse(id)
            .then(() => HouseService.getAllHouses())
            .then(houses => this.render(houses));
    }

    static addRoom(houseId) {
        const house = this.houses.find(h => h.id == houseId);
        const roomName = $(`#${houseId}-room-name`).val();
        const roomArea = parseFloat($(`#${houseId}-room-area}`).val());

        if (roomName && !isNaN(roomArea)) {
            house.addRoom(roomName, roomArea);
            HouseService.updateHouse(house)
                .then(() => HouseService.getAllHouses())
                .then(houses => this.render(houses));
        } else {
            alert('Please enter valid room details.');
        }
    }

    static deleteRoom(houseId, roomId) {
        const house = this.houses.find(h => h.id == houseId);
        house.rooms = house.rooms.filter(room => room.id != roomId);
        HouseService.updateHouse(house)
            .then(() => HouseService.getAllHouses())
            .then(houses => this.render(houses));
    }

    static render(houses) {
        this.houses = houses;
        $("#app").empty();
        for (let house of houses) {
            $("#app").prepend(
                `<div id="${house.id}" class="card">
                    <div class="card-header">
                        <h2>${house.name}</h2>
                        <button class="btn btn-danger" onClick="DOMManager.deleteHouse('${house.id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-sm">
                                <input type="text" id="${house.id}-room-name" class="form-control" placeholder="Room Name">
                            </div>
                            <div class="col-sm">
                                <input type="text" id="${house.id}-room-area" class="form-control" placeholder="Room Area">
                            </div>
                        </div>
                        <button id="${house.id}-new-room" onClick="DOMManager.addRoom('${house.id}')" class="btn btn-primary form-control">Add</button>
                    </div>
                </div>
                <br>`
            );
            for (let room of house.rooms) {
                $(`#${house.id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${room.id}"><strong>Name: </strong> ${room.name}</span>
                        <span id="area-${room.id}"><strong>Area: </strong> ${room.area}</span>
                        <button class="btn btn-danger" onClick="DOMManager.deleteRoom('${house.id}', '${room.id}')">Delete Room</button>
                    </p>`
                );
            }
        }
    }
}
/* Document ready used to setup event listener it fetches the houses when the web page is fully loaded*/ 
$(document).ready(function() {
    $('#create-new-house').click(() => {
        const houseName = $('#new-house-name').val().trim();
        if (houseName) {
            DOMManager.createHouse(houseName);
            $('#new-house-name').val("");
        } else {
            alert('Please enter a house name.');
        }
    });
    DOMManager.getAllHouses();
});









