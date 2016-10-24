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
  Dimensions,
  Text,
} from 'react-native';
import Keychain from 'react-native-keychain';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome'
import {DoubleBounce} from 'react-native-loader';

import LogWindow from './src/LogWindow.js'
import ActList from './src/ActList.js'

const apiRoot = "https://intra.epitech.eu/"


export default class EpiToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loged: false,
      loading: true,
    }
    this.tryToLogOnMount = true
  }

  logedIn = () => {
    this.tryToLogOnMount = false
    this.setState({loged: true})
  }

  switchLoading = (to) => {
    this.setState({loading: to})
  }

  logOut = () => {
   const header = {
       method: "POST",
   }
   Keychain.setGenericPassword("UNDEFINED", "UNDEFINED")
   this.setState({loged: false})
   return fetch(apiRoot + "/logout?format=json", header).then(res => res.json()).catch(e => null)
  }

  ActionButton = () =>
  <ActionButton
    icon={<Icon name="gear" style={styles.actionButtonIcon} size={20} color="white"/>}
    buttonColor="grey"
    offsetX={-20}
    offsetY={-30}
    style={{width: 10}}
    outRangeScale={0.8}
  >
    <ActionButton.Item buttonColor='#EF5350' title="Log Out" onPress={() => this.logOut()}>
      <Icon name="sign-out" style={styles.actionButtonIcon} size={30}/>
    </ActionButton.Item>
  </ActionButton>

  displayLoadingScreen = () => {
    if (!this.state.loading) return null
    return (
      <View style={styles.loading}>
        <DoubleBounce size={100} color="#FFF" />
        <Text style={{color: "white", fontStyle: "italic", marginTop: 5}}>Extracting your skillz</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.loged ?
          <LogWindow switchLoading={this.switchLoading} tryToLogOnMount={this.tryToLogOnMount} logedIn={this.logedIn}/>
          :
          <View style={styles.container}>
            <ActList switchLoading={this.switchLoading} />
            {this.ActionButton()}
          </View>
        }
        {this.displayLoadingScreen()}
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
  loading: {
    justifyContent: "center",
    alignItems: "center",
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0, left: 0,
    backgroundColor: "#b3d4fc",
    elevation: 100
  }
});

AppRegistry.registerComponent('EpiToken', () => EpiToken);


//Curent section
//alerte activité
//options :
  //choisir temps entre alerte / desactiver
  //theme
  //deconexion
//menu login plus beau
//decouper en fichier

//Inscriptions
