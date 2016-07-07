describe('Tab Controller', function(){

  var tabController;

  beforeEach(module('shuffling'));
  beforeEach(function(){
    module(function($provide) {
      $provide.value('tabValue', {selected: 1});
    });
    inject(function($controller) {
      tabController = $controller('TabController');
    });
  });

  it('should set and get the value of the tab value service', function(){
    var tabValue;
    inject(function($injector){
      tabValue = $injector.get('tabValue');
    });
    expect(tabValue.selected).toBe(1);
    expect(tabController.checkTab(1)).toBe(true);
    tabController.setTab(2);
    expect(tabValue.selected).toBe(2);
    expect(tabController.checkTab(2)).toBe(true);
  });
});

describe('Form Controller', function(){

  var formController;
  var mockData = [];
  var mockDataSvc = {
    create: function(item) {mockData.push(item);}
  };
  beforeEach(module('shuffling'));
  beforeEach(function() {
    module(function($provide) {
      $provide.value('tabValue', {selected: 1});
      $provide.value('dataService', mockDataSvc);
    });
    inject(function($controller){
      formController = $controller('FormController');
    });
  });

  it("should pass an item to the create method on the data service and switch to the second tab", function(){
    var tabValue;
    inject(function($injector){
      tabValue = $injector.get('tabValue');
    });
    expect(tabValue.selected).toBe(1); // starts on the first (Guest) tab
    formController.name = "Josie Morales";
    formController.transdate = "2009-07-16T04:00:00.000Z";
    formController.status = "pickup";
    formController.location = "City Hall";
    formController.addGuest();
    expect(mockData.length).toBe(1);
    expect(mockData[0].name).toBe("Josie Morales");
    expect(tabValue.selected).toBe(2); // switches to the second (List) tab
  });

});

describe('List Controller', function(){

  var listController;
  var mockData = [
    // Create a couple guests so we can test read, update and delete.
    {name: 'George Meacham', transdate: new Date('2013-03-21T04:00:00.000Z'), status: 'pickup', location: 'Fort Dix'},
    {name: 'Frank Elliott', transdate: new Date('2014-12-30T04:00:00.000Z'), status: 'dropoff', location: 'Yankee Stadium'}
  ];
  var mockDataSvc = {
      read: function() {return mockData;},
    update: function(index, item) {mockData[index] = item;},
    delete: function(index) {mockData.splice(index,1);}
  };

  beforeEach(module('shuffling'));
  beforeEach(function() {
    module(function($provide) {
      $provide.value('dataService', mockDataSvc);
    });
    inject(function($controller){
      listController = $controller('ListController');
    });
  });

  it("should read the guests from the service upon creation", function(){
    expect(listController.guests.length).toBe(2);
    expect(listController.guests[0].name).toBe("George Meacham");
    expect(listController.guests[1].name).toBe("Frank Elliott");
  });

  it("should tell the view when to display the 'arrived' status change button", function(){
    expect(listController.showArrived('arrived')).toBe(false);
    expect(listController.showArrived('pickup')).toBe(true);
    expect(listController.showArrived('dropoff')).toBe(true);
  });

  it("should tell the view when to display the 'pickup' status change button", function(){
    expect(listController.showPickup('arrived')).toBe(true);
    expect(listController.showPickup('pickup')).toBe(false);
    expect(listController.showPickup('dropoff')).toBe(false);
  });

  it("should change the item's status to 'arrived' when requested", function(){
    expect(mockData[0].status).not.toBe("arrived");
    listController.setArrived(0);
    expect(mockData[0].status).toBe("arrived");
  });

  it("should change the item's status to 'pickup' when requested", function(){
    expect(mockData[0].status).not.toBe("pickup");
    listController.setPickup(0);
    expect(mockData[0].status).toBe("pickup");
  });

  it("should update a guest correctly given only partial data", function(){
    var saveName = mockData[1].name;
    var saveTransDate = mockData[1].transdate;
    var saveStatus = mockData[1].status;
    var saveLocation = mockData[1].location;

    listController.updateGuest(1, {name: "George Kaplan"}); // Should change name and leave other data unchanged
    expect(mockData[1].name).not.toBe(saveName);
    expect(mockData[1].name).toBe("George Kaplan");
    expect(mockData[1].transdate).toBe(saveTransDate);
    expect(mockData[1].status).toBe(saveStatus);
    expect(mockData[1].location).toBe(saveLocation);

    listController.updateGuest(1, {status: "pickup", location: "Nantucket"}); // Should change status and location and leave other data unchanged
    expect(mockData[1].name).toBe("George Kaplan");
    expect(mockData[1].transdate).toBe(saveTransDate);
    expect(mockData[1].status).toBe("pickup");
    expect(mockData[1].location).toBe("Nantucket");

  });

  describe("Soft delete feature", function(){

    beforeEach(function(){
      // start each test with one item marked for deletion
      listController.markForDelete(1);
    });

    it("should add an item to the internal array when an item is marked for deletion", function(){
      expect(listController.toBeDeleted.length).toBe(1);
      expect(listController.toBeDeleted[0]).toBe(1);
    });

    it("should delete an item from the internal array when an item is unmarked for deletion", function(){
      listController.unmarkForDelete(1);
      expect(listController.toBeDeleted.length).toBe(0);
    });

    it("should be able to tell the view when an item has been marked for deletion", function(){
      expect(listController.isMarkedForDeletion(0)).toBe(false);
      expect(listController.isMarkedForDeletion(1)).toBe(true);
    });

    it("should tell the view when to display the delete confirmation button", function(){
      expect(listController.showConfirmButton()).toBe(true);
      listController.unmarkForDelete(1);
      expect(listController.showConfirmButton()).toBe(false);
    });

    it("should be able to tell the view the name of a guest to be deleted", function(){
      expect(listController.getName(1)).toBe("George Kaplan");
    });

    it("should be able to clear all itms selected for deletion", function(){
      expect(listController.toBeDeleted.length).toBe(1);
      listController.markForDelete(0);
      expect(listController.toBeDeleted.length).toBe(2);
      listController.clearSelections();
      expect(listController.toBeDeleted.length).toBe(0);
    });

    it("should delete marked items", function(){
      expect(mockData.length).toBe(2);
      expect(listController.toBeDeleted.length).toBe(1);
      listController.deleteSelectedGuests();
      expect(mockData.length).toBe(1);
      expect(listController.toBeDeleted.length).toBe(0);
    });

  });
});
