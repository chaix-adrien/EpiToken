import React, { Component } from 'react';
import {
  View,
  Dimensions,
  TextInput,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import TextField from 'react-native-md-textinput';

import logo from './resources/logo.png'
const apiRoot = "https://intra.epitech.eu/"
var Keychain = require('react-native-keychain');

export default class LogWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login: "",
      password: "",
      loading: true,
    }
    if (this.props.tryToLogOnMount) {
      Keychain.getGenericPassword().then(credentials => {
        this.try_logIn(credentials.username, credentials.password)
      }).catch(e => {
        this.setState({loading: false})
        this.props.switchLoading(false)
      })
    } else {
      this.props.switchLoading(false)
      this.state.loading = false
    }
  }


  logIn = (log, pass) => {
    var data = new FormData();
    data.append("login", log)
    data.append("password", pass)
    const header = {
      method: "POST",
      body: data
    }
    return fetch(apiRoot + "?format=json", header).then(res => res.json()).then(rep => {
      if (rep.message && log !== "UNDEFINED") {
        Alert.alert("Error while login:", rep.message)
      }
      return !rep.message
    }).catch(e => null)
  }

  try_logIn = (log, pass) => {
    return this.setState({loading: true}, () => {
      return this.logIn(log, pass).then(rep => {
        if (rep) {
          Keychain.setGenericPassword(log, pass)
          this.props.switchLoading(true)
          this.props.logedIn()
          return true
        }
        this.props.switchLoading(false)
        this.setState({loading: false})
        return false
      })
    })
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{flex: 2, margin: 5, padding: 5, backgroundColor: "white", elevation: 5, justifyContent: "flex-start"}}>
          <TextField label={'e-mail'} highlightColor={'#00BCD4'} 
            style={{width: Dimensions.get("window").width - 10}}
            value={this.state.login}
            onChangeText={(text) => this.setState({login: text})}
            autoCorrect={false}
            autoCapitalize={'none'}
            keyboardType={'email-address'}
            onSubmitEditing={() => this.try_logIn(this.state.login, this.state.password)}
          />
          <TextField label={'Password'} highlightColor={'#00BCD4'} 
            style={{width: Dimensions.get("window").width - 10}}
            value={this.state.password}
            ref={(elem) => (this.passwordInput = elem)}
            onChangeText={(text) => this.setState({password: text})}
            autoCorrect={false}
            autoCapitalize={'none'}
            secureTextEntry={true}
            onSubmitEditing={() => this.try_logIn(this.state.login, this.state.password)}
          />
        </View>
        <View
          style={{margin: 10, backgroundColor: "white", elevation: 10, borderRadius: 5}}
        >
          <Icon.Button 
          style={{elevation: 10}}
          name="sign-in" backgroundColor="#2196f3" onPress={() => this.try_logIn()}>
            Pick Up my Gauje
          </Icon.Button>
        </View>
        <Image
          style={styles.logo}
          source={logo}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: null,
    height: null,
    flex: 4,
    resizeMode:'contain',
  }
})
