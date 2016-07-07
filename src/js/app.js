var app = angular.module('shuffling', []);

app.value('tabValue', {selected: 1});

app.value('seedGuests', [
  {name: 'Regina Mulroney', transdate: new Date('2015-07-15T04:00:00.000Z'), status: 'arrived', location: 'front portico'},
  {name: 'Susan Tashjian', transdate: new Date('2015-09-01T04:00:00.000Z'), status: 'arrived', location: ''},
  {name: 'Heidi Ellison', transdate: new Date('2014-11-21T04:00:00.000Z'), status: 'arrived', location: 'day room'},
  {name: 'Eddie Newman', transdate: new Date('2015-02-28T04:00:00.000Z'), status: 'pickup', location: 'dining room'},
  {name: 'Lonnie Jackson', transdate: new Date('2012-07-05T04:00:00.000Z'), status: 'pickup', location: '4212 Jerome Blvd, NY, NY'}]
);

app.controller('TabController', ['tabValue', function(tabValue){

  this.setTab = function(tabNum) {
    tabValue.selected = tabNum;
  };

  this.checkTab = function(tabNum) {
    return tabValue.selected === tabNum;
  };
}]);

app.controller('FormController', ['tabValue', 'dataService', 'dateFilter', function(tabValue, dataService, dateFilter){

  var defaultStatus = 'pickup';
  this.status = defaultStatus;

  this.addGuest = function() {

    var newGuest = {};
    newGuest.name = this.name;
    newGuest.transdate = this.transdate;
    newGuest.status = this.status;
    newGuest.location = (this.status === "pickup" ? this.location : "");

    dataService.create(newGuest);

    this.name = "";
    this.transdate = "";
    this.status = defaultStatus;
    this.location = "";

    tabValue.selected = 2;
  };

  this.showLocation = function() {
    return (this.status === 'pickup');
  };

  this.formattedDate = function(){
    return dateFilter(this.transdate, "MMMM d, yyyy");
  };

}]);

app.controller('ListController', ['dataService', 'dateFilter', function(dataService, dateFilter){

  this.guests = dataService.read();

  this.showArrived = function(status) {
    return (status === 'pickup' || status === 'dropoff');
  };

  this.showPickup = function(status) {
    return (status === 'arrived');
  };

  this.setArrived = function(index) {
    var changeObj = {};
    changeObj.status = "arrived";
    this.updateGuest(index, changeObj);
  };

  this.setPickup = function(index) {
    var changeObj = {};
    changeObj.status = "pickup";
    this.updateGuest(index, changeObj);
  };

  this.formatDate = function(unformattedDate) {
    return(dateFilter(unformattedDate, "MMMM d, yyyy"));
  };

  this.updateGuest = function(index, changeObj) {
    var changedGuest = {};
    changedGuest.name = changeObj.name === undefined ? this.guests[index].name : changeObj.name;
    changedGuest.transdate = changeObj.transdate === undefined ? this.guests[index].transdate : changeObj.transdate;
    changedGuest.status = changeObj.status === undefined ? this.guests[index].status : changeObj.status;
    changedGuest.location = changeObj.location === undefined ? this.guests[index].location : changeObj.location;

    dataService.update(index, changedGuest);
  };

  ////////////////////////////////
  // Soft delete support
  ////////////////////////////////
  this.toBeDeleted = [];

  this.markForDelete = function(index) {
    this.toBeDeleted.push(index);
  };

  this.unmarkForDelete = function(idx) {
    var deletionPoint;
    this.toBeDeleted.forEach(function(item, arrayIdx){
      if (item === idx) { deletionPoint = arrayIdx; }
    });
    if (deletionPoint !== null) {
      this.toBeDeleted.splice(deletionPoint, 1);
    }
  };

  this.isMarkedForDeletion = function(idx){
    var rtnValue = false;
    this.toBeDeleted.forEach(function(item){
      if (item === idx) { rtnValue = true; }
    });
    return rtnValue;
  };

  this.showConfirmButton = function() {
    return this.toBeDeleted.length > 0;
  };

  this.getName = function(idx) {
    return this.guests[idx].name;
  };

  this.clearSelections = function() {
    this.toBeDeleted.length = 0;
  };

  this.deleteSelectedGuests = function() {
    // Sort ascending...
    this.toBeDeleted.sort(function(a, b){
      return a - b;
    });
    // .. and process from the end forward.
    while(this.toBeDeleted.length) {
      var item = this.toBeDeleted.pop();
      dataService.delete(item);
    }
  };

}]);

app.service("dataService", ['seedGuests', function(seedGuests){
  var guests = [];

  var load = function(){
    var guestsFromLocalStorage = localStorage.getItem('shufflingPinesGuests');

    if (guestsFromLocalStorage === null) {
      // No key yet. Provide some defaults.
      guests = seedGuests;
    } else if (guestsFromLocalStorage !== "") {
      // Key value will be empty if all guests have been deleted. Parse
      // the data from local storage only if guests exist.
      guests = JSON.parse(localStorage.getItem('shufflingPinesGuests'));
    }
  };

  var save = function(){
    localStorage.setItem('shufflingPinesGuests', angular.toJson(guests));
    console.log(guests); // Output the full data array to console.log
  };

  this.create = function(newGuest){
    guests.push(newGuest);
    save();
  };

  this.read = function() { return guests;};

  this.update = function(index, changedGuest) {
    guests[index] = changedGuest;
    save();
  };

  this.delete = function(index) {
    guests.splice(index, 1); // remove 1 element starting at the index.
    save();
  };

  load(); // Load guests on module init.

}]);
