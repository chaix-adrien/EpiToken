import React, { Component } from 'react';
import {
  View,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';

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
      }).catch(e => this.setState({loading: false}))
    } else {
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
          this.props.logedIn()
          return true
        }
        this.setState({loading: false})
        return false
      })
    })
  }

  render() {
    return (
      <View>
        <Spinner visible={this.state.loading} />
        <TextInput
          style={{width: Dimensions.get("window").width, height: 50}}
          value={this.state.login}
          onChangeText={(text) => this.setState({login: text})}
          placeholder="e-mail"

          autoCorrect={false}
          autoCapitalize={'none'}
          keyboardType={'email-address'}
          onSubmitEditing={() => this.try_logIn(this.state.login, this.state.password)}
       />
        <TextInput
          style={{width: Dimensions.get("window").width, height: 50}}
          ref={(elem) => (this.passwordInput = elem)}
          onChangeText={(text) => this.setState({password: text})}
          placeholder="Password"
          autoCorrect={false}
          autoCapitalize={'none'}
          secureTextEntry={true}
          onSubmitEditing={() => this.try_logIn(this.state.login, this.state.password)}
        />
        <Icon.Button name="gear" backgroundColor="#3b5998" onPress={() => this.try_logIn()}>
          Log In
        </Icon.Button>
      </View>
    );
  }
}
