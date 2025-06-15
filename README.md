# rn-camera
A simple, minimalistic camera/gallery app written in React Native as a project for mobile app lessons.

## Functionalities
- Gallery mode - browse and delete photos taken with the app on a grid or list
- Viewer mode - view the photos on full screen, delete them and share them with other apps
- Camera mode - take geotagged photos with the front and back camera, adjust settings like zoom, torch, aspect ratio and image size
- Map mode - view the locations where photos were taken on Google Maps and browse them based on geotags

## Important note
This app won't work fully when opened using Expo Go, as on new Android versions projects previewed this way don't have access to the media library and the camera. A development build has to be created and installed on the device, and a Google Maps API key should be present in an .env file. Alternatively, if you just want to check out the app, you can download the .apk from the Releases section.