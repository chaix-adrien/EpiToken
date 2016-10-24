/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
} from 'react-native';

import LogWindow from './src/LogWindow.js'
import ActList from './src/ActList.js'

export default class EpiToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loged: false,
    }
  }

  logedIn = () => {
    this.setState({loged: true})
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.loged ? 
          <ActList />
          : <LogWindow logedIn={this.logedIn}/>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('EpiToken', () => EpiToken);

//alerte activité
//options :
  //choisir temps entre alerte / desactiver
  //theme
  //deconexion
//menu login plus beau
//decouper en fichier

//Inscriptions
