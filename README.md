# contour-data-accelerator

Delegate Montage-Data services fetchData to server side.

## Test data-accelerator

1. Install
```
git clone git@github.com:montagestudio/contour-data-accelerator.git
cd ../contour-data-accelerator
npm install 
```

2. Run sample
```
cd sample
npm install
cd ..
npm run start:sample
```

## Accelerate an existing montage module services.

1. Install 
```
npm install git://github.com:montagestudio/contour-data-accelerator --save
```

2. Configure to your main module and services with model and name.
```
See sample-server.js
```

3. Start 

```
node sample-server.js
```
