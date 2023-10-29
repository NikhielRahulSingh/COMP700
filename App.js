import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

function App() {
  const [pickedImagePath, setPickedImagePath] = useState('');
  const [prediction, setPrediction] = useState(null);

  const showImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    console.log(result);

    if (!result.cancelled) {
      setPickedImagePath(result.uri);
      console.log(result.uri);
    }
  }

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();

    console.log(result);

    if (!result.cancelled) {
      setPickedImagePath(result.uri);
      console.log(result.uri);
    }
  }

  const removeImage = () => {
    setPickedImagePath('');
    setPrediction(null);
  }

  const sendImageToServer = async (imageUri) => {
    try {
      const formData = new FormData();
      const image = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'file',
      };
      formData.append('file', image);
  
      const response = await axios.post(
        'https://us-central1-comp700.cloudfunctions.net/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setPrediction(response.data); 
      console.log(response.data);

    } catch (error) {
      console.error('Error sending image:', error);
    }
  }
  

  const sendToServerButtonPressed = () => {
    if (pickedImagePath !== '') {
      sendImageToServer(pickedImagePath);
    } else {
      alert('No image selected.');
    }
  }

  return (
    <View style={styles.screen}>
      {/* Title */}
      <Text style={styles.title}>MY PSORIASIS DETECTION APP</Text>

      <View style={styles.buttonContainer}>
        <Button onPress={showImagePicker} title="Select an image" />
        <Button onPress={openCamera} title="Open camera" />
      </View>

      <View style={styles.imageContainer}>
        {pickedImagePath !== '' && (
          <>
            <Image source={{ uri: pickedImagePath }} style={styles.image} />
            <Button onPress={removeImage} title="Remove Image" color="red" />
            <Button
              onPress={sendToServerButtonPressed}
              title="Predict"
              color="green"
            />
          </>
        )}
      </View>

      {prediction && (
        <View style={styles.predictionContainer}>
          <Text>Class: {prediction.Class}</Text>
          <Text>Confidence: {prediction.Confidence}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#87CEEB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20, // Add margin to push the title down a bit
  },
  buttonContainer: {
    width: 400,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageContainer: {
    padding: 30,
  },
  image: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
});

export default App;
