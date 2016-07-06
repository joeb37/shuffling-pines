# Assignment 2

## Shuffling Pines

#### Joe Bockskopf
CSCI E-32 <br/>
jbockskopf@g.harvard.edu<br/>

### Prerequisites
- *node/npm*, *bower* and *gulp* must all be installed globally.

### Installation:
- Unzip shuffling-pines.zip.
- Enter the following commands to install required components and build the end-user application:
  - `cd shuffling-pines`
  - `npm install`
  - `bower install`
  - `gulp`
- Go to http://localhost:8080 or open file `dist/index.html` to launch the application.

### App Details

#### Three Controllers
- _TabController_ - Handles whether the Form tab or the Guest tab is displayed.
- _FormController_ - Manages items on the Form tab.
- _ListController_ - Manages items on the Guests tab.

#### Three Services
- _tabValue_ (value) - Holds the selected tab state. Value is an object literal.  Set by the FormController.  Read by the TabController.
- _seedGuests_ (value) - Collection of items to be used as defaults if no data resource is found in local storage. Value is an array. Read by the dataService.
- _dataService_ (service) - Stores guests in an array in local storage with the key 'shufflingPinesGuests'. Exposes create, read, update and delete functions. If the key shufflingPinesGuests doesn't exist, default guests are read from the seedGuests service.

#### Testing Notes
- Tested on Chrome, Safari and Firefox on a Mac.  Tested on Chrome, Firefox, Internet Explorer 11 and Edge on a PC.
- Safari doesn't handle the 'required' attribute the way the other browsers do.  It will allow the form to be submitted with the name and date blank.
- Safari doesn't handle the 'autocomplete="false"' attribute.  It will remember names and dates.  Autofilling the name and date fields will not update the controller.

#### Extras
- The soft delete extra credit item is included.
- There is a 'zip' gulp task to create the submission file.  To use this feature, run `npm install gulp-zip` and then `gulp zip`. The main `gulp` build command should work fine with or without gulp-zip.
