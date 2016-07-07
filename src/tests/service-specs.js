describe('Tab Value Service', function(){

  var tabValueService;

  beforeEach(module('shuffling'));
  beforeEach(function(){
    inject(function($injector) {
      tabValueService = $injector.get('tabValue');
    });
  });

  it('should be changeable', function(){
    var original = tabValueService.selected;
    tabValueService.selected = original + 1;
    expect(tabValueService.selected).toBe(original + 1);
  });
});

describe('Seed Value Service', function(){

  var seedGuestService;

  beforeEach(module('shuffling'));
  beforeEach(function(){
    inject(function($injector) {
      seedGuestService = $injector.get('seedGuests');
    });
  });

  it('should have some data elements', function(){
    expect(seedGuestService.length).not.toBe(0);
  });

  it('should have the structure required by the app', function(){
    expect(seedGuestService[0].name).not.toBeUndefined();
    expect(seedGuestService[0].transdate).not.toBeUndefined();
    expect(seedGuestService[0].status).not.toBeUndefined();
    expect(seedGuestService[0].location).not.toBeUndefined();
  });

});

describe('Guest Data Service', function(){
  var dataService, seedGuests;
  var localStore = {};
  beforeEach(module('shuffling'));
  beforeEach(function(){
    module(function($provide) {
      $provide.value('seedGuests', [
        {name: 'George Meacham', transdate: new Date('2013-03-21T04:00:00.000Z'), status: 'pickup', location: 'Fort Dix'},
        {name: 'Frank Elliott', transdate: new Date('2014-12-30T04:00:00.000Z'), status: 'dropoff', location: 'Yankee Stadium'}
      ]);
    });

    inject(function($injector) {
      dataService = $injector.get('dataService');
      seedGuests = $injector.get('seedGuests');
    });
    spyOn(localStorage, "getItem").and.callFake(function(key){
      console.log("Reading " + key + ": " + localStore[key]);
      return localStore[key] || '[]';
    });
    spyOn(localStorage, "setItem").and.callFake(function(key, value){
      localStore[key] = value + '';
    });
    spyOn(localStorage, "clear").and.callFake(function(){
      localStore = {};
    });
  });

  it ('should read guests', function(){
    var guests = dataService.read();
    expect(guests).not.toBeUndefined();
  });

  it ('should automatically create seed guests when local storage is empty', function(){
    var guests = dataService.read();
    expect(guests.length).toBe(2);

    // check the names of the five default guests
    expect(guests[0].name).toBe("George Meacham");
    expect(guests[1].name).toBe("Frank Elliott");
  });

  it('should add a guest', function(){
    // Create the new guest
    var newGuest = {};
    newGuest.name = "Derek Morrow";
    newGuest.transdate = new Date("11/5/2002");
    newGuest.status = "pickup";
    newGuest.location = "Harvard Square";
    dataService.create(newGuest);

    // Get the guests from local storage and verify the guest has been added.
    var guestLocalStore = JSON.parse(localStore.shufflingPinesGuests);
    expect(guestLocalStore.length).toBe(3);
    expect(guestLocalStore[2].name).toBe(newGuest.name);
    expect(guestLocalStore[2].transdate).toBe(newGuest.transdate.toJSON());
    expect(guestLocalStore[2].status).toBe(newGuest.status);
    expect(guestLocalStore[2].location).toBe(newGuest.location);
  });

  it('should update a guest', function(){

    // modify an existing guest and update
    var changedGuest = {};
    changedGuest.name = "Evan Grant";
    changedGuest.transdate = new Date('04/03/2010');
    changedGuest.status = "arrived";
    changedGuest.location = "Inman Square";
    dataService.update(0, changedGuest);

    // Get the guests from local storage and verify the guest has been changed.
    var guestLocalStore = JSON.parse(localStore.shufflingPinesGuests);
    expect(guestLocalStore[0].name).toBe(changedGuest.name);
    expect(guestLocalStore[0].transdate).toBe(changedGuest.transdate.toJSON());
    expect(guestLocalStore[0].status).toBe(changedGuest.status);
    expect(guestLocalStore[0].location).toBe(changedGuest.location);

  });

  it('should delete a guest', function(){
    var guestLocalStore = JSON.parse(localStore.shufflingPinesGuests);
    var origItemCount = guestLocalStore.length;
    expect(origItemCount).toBeGreaterThan(0);

    dataService.delete(0);

    guestLocalStore = JSON.parse(localStore.shufflingPinesGuests);
    expect(guestLocalStore.length).toEqual(origItemCount - 1);

  });

});
