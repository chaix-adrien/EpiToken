/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View,
  Dimensions,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';

var Keychain = require('react-native-keychain');

const apiRoot = "https://intra.epitech.eu/"
const days_name = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
]

const month_name = [
  "Javier",
  "Fevier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "septembre",
  "Octobre",
  "Novembre",
  "Decembre",
]

const sectionContent = ["TOKEN", "Aujourd'hui", "Demain", "7 Jours", "30 Jours"]
const sectionsID = sectionContent.map((s, id) => id)

const getStartDate = () => {
  const start = new Date(Date.now())
  if (__DEV__)
    return "2015-10-01"
  return start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate()
}
const getEndDate = () => {
  const start = new Date(getStartDate())
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30)
  return end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate()
}
const getNowDate = () => getStartDate()

export class ActivitieToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      token: "",
    }
  }

  isValidToken = (token) => {
    if (!token) return false
    if (token.length !== 8) return false
    if (token.match(/^\d+$/)) return true
  }

  sendToken = () => {
    if (!this.isValidToken(this.state.token)) {
      Alert.alert("Token Invalide", "Un token est composé de 8 chiffres")
      return
    }
    this.props.sendToken(this.props.activitie, this.state.token).then(res => {
      if (res) {
        this.setState({token: ""})
      }
    })
  }

  render() {
    const {activitie} = this.props
    if (!activitie) return null
    const date = new Date(activitie.start.split(' ')[0])
    let room = activitie.room.code.split('/')
    room = room[room.length - 1]
    return (
      <View style={styles.tokenContainer}>
        <View style={{flexDirection: "row"}}>
          <View style={{flex: 8}}>
            <Text style={styles.activitieTitle}>{activitie.acti_title}</Text>
            <Text style={styles.date}>{days_name[date.getDay()]} {date.getDate()} {month_name[date.getMonth()]} - {activitie.start.split(' ')[1].split(':').slice(0, 2).join(':')}</Text>
          </View>
          <Text style={[styles.room, {flex: 2}]}>{room}</Text>
        </View>
        <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10}}>
          <TextInput
            style={{width: Dimensions.get("window").width - 70, height: 50, fontSize: 20}}
            value={this.state.token}
            onChangeText={(text) => this.setState({token: text})}
            placeholder="Enter token here"
            autoCorrect={false}
            autoCapitalize={'none'}
            keyboardType={'numeric'}
            onSubmitEditing={() => this.sendToken()}
          />
          <Icon
            name="check-circle"
            size={30}
            color={this.isValidToken(this.state.token) ? "green" : "grey"}
            style={{margin: 3, marginRight: 10}}
            onPress={() => this.sendToken()}
          />
        </View>
      </View>
    );
  }
}

export class Activitie extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {activitie, section} = this.props
    const date = new Date(activitie.start.split(' ')[0])
    let room = activitie.room.code.split('/')
    room = room[room.length - 1]
    return (
      <View style={styles.activitieContainer}>
        <View style={{flex: 6}}>
          <Text style={styles.activitieTitle}>{activitie.acti_title}</Text>
          <Text style={styles.moduleTitle}>{activitie.titlemodule}</Text>
          {section > 1 ?
            <Text style={styles.date}>{days_name[date.getDay()]} {date.getDate()} {month_name[date.getMonth()]}</Text>
            : null
          }
        </View>
        <Text style={styles.room}>{room}</Text>
        <View style={{flexDirection: "row", alignItems: "center", flex:2}}>
          <Icon name="long-arrow-down" size={30} color="#DDDDDD" style={{margin: 3}} />
          <View>
            <Text style={styles.activitieTitle}>{activitie.start.split(' ')[1].split(':').slice(0, 2).join(':')}</Text>
            <Text style={styles.activitieTitle}>{activitie.end.split(' ')[1].split(':').slice(0, 2).join(':')}</Text>
          </View>
        </View>
      </View>
    );
  }
}


export class LogWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      login: "",
      password: "",
      loading: true,
    }
    Keychain.getGenericPassword().then(credentials => {
      this.props.verify_this_login(credentials.username, credentials.password).then((rep) => !rep ? this.setState({loading: false}) : null)
    })
  }

  try_logIn = () => {
    this.setState({loading: true}, () => {
      this.props.verify_this_login(this.state.login, this.state.password).then((rep) => !rep ? this.setState({loading: false}) : null)
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
          onSubmitEditing={() => this.try_logIn()}
       />
        <TextInput
          style={{width: Dimensions.get("window").width, height: 50}}
          ref={(elem) => (this.passwordInput = elem)}
          onChangeText={(text) => this.setState({password: text})}
          placeholder="Password"
          autoCorrect={false}
          autoCapitalize={'none'}
          secureTextEntry={true}
          onSubmitEditing={() => this.try_logIn()}
        />
        <Icon.Button name="gear" backgroundColor="#3b5998" onPress={() => this.try_logIn()}>
          Log In
        </Icon.Button>
      </View>
    );
  }
}

export default class EpiToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activities: [],
      refreshing: false,
      loged: false,
    }
  }

  logOut = () => {
   const header = {
       method: "POST",
   }
   return fetch(apiRoot + "/logout?format=json", header).then(res => res.json()).catch(e => null)
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
    if (rep.message) {
      Alert.alert("Error while login:", rep.message)
    }
    return !rep.message}).catch(e => null)
  }

  loadActivities = () => {
   var data = new FormData();
   data.append("start", getStartDate())
   data.append("end", getEndDate())
   const header = {
    method: "POST",
    body: data
   }
   fetch(apiRoot + "planning/load" + "?format=json", header).then(res => res.json())
   .then(activitiesBrut => {
    if (activitiesBrut.message) return
    const myActivities = activitiesBrut.filter(act => (__DEV__) ? act.event_registered : act.event_registered === "registered")
    const out = sectionContent.map(e => [])
    const today = new Date(getNowDate())
    myActivities.forEach((act, id) => {
      const actDate = new Date(act.start.split(' ')[0])
      if (__DEV__ && Math.random() < 0.1)
        act.allow_token = true
      if (act.allow_token) {
        out[0].push(act)
      } else if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24) {
        out[1].push(act)
      } else if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24 * 2) {
        out[2].push(act)
      } else if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24 * 7) {
        out[3].push(act)
      } else {
        out[4].push(act)
      }
    })
    this.setState({activities: out, refreshing: false})
   })
  }

  verify_this_login = (log, pass) => {
    return this.logIn(log, pass).then(rep => {
      if (rep) {
        Keychain.setGenericPassword(log, pass)
        this.loadActivities()
        this.setState({loged: true, refreshing: true})
        return true
      }
      return false
    })
  }

  getTokenLink = (act) => {
    return `${apiRoot}/module/${act.scolaryear}/${act.codemodule}/${act.codeinstance}/${act.codeacti}/${act.codeevent}/token?format=json`
  }

  deleteActivitie = (acts, act) => {
    let out = JSON.parse(JSON.stringify(acts))
    const actStr = this.getTokenLink(act)
    out = out.map((part) => {
      if (!part || !part.length) return part
      for (let i = 0; i < part.length; i++) {
        if (actStr === this.getTokenLink(part[i])) {
          part = part.slice(0, i).concat(part.slice(i + 1, part.length))
          return part
        }
      }
      return part
    })
    return out
  }

  sendToken = (act, token) => {
    var data = new FormData();
    data.append("token", token)
    data.append("rate", 0)
    data.append("comment", "I Love Adrien Chaix <3")
    const header = {
      method: "POST",
      body: data
    }
    return fetch(this.getTokenLink(act), header)
    .then(res => res.json())
    .then(rep => {
      if ((__DEV__) ? !rep.error : rep.error) {
        Alert.alert("Mauvais token:", rep.error)
        return false
      } else {
        this.setState({activities: this.deleteActivitie(this.state.activities, act)})
        return true
      }
    })
  }

  render() {
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (r1, r2) => r1 !== r2})
    return (
      <View style={styles.container}>
        <Spinner visible={this.state.refreshing} />
        {!this.state.loged ?
          <LogWindow verify_this_login={this.verify_this_login}/>
          : null
        }
        {(this.state.activities.some(e => e.length) && this.state.loged) ?
          <ListView
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.loadActivities}/>}
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRowsAndSections(this.state.activities, sectionsID)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) => (sid === 0 ) ? <ActivitieToken sendToken={this.sendToken} activitie={rowData} />: <Activitie activitie={rowData} section={sid}/>}
            renderSectionHeader={(data, id) => (data.length) ? <Text style={[styles.header, {backgroundColor: id ? "#81d4fa" : "#EF5350"}]}>{sectionContent[id]}</Text> : null}
          />
          : (this.state.loged) ? <Text style={styles.activitieTitle}>There is no activities for you !</Text>
          : null
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
  activitieContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: "white",
    padding: 5,
    elevation: 5,
  },
  tokenContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
    marginTop: 2,
    marginBottom: 2,
    backgroundColor: "white",
    padding: 5,
    elevation: 5,
  },
  activitieTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  moduleTitle: {
    fontSize: 15,
  },
  header: {
    flex: 1,
    padding: 5,
    elevation: 20,
    fontWeight: "bold",
    fontSize: 30,
    color: "black",
    textShadowColor: "#01579b",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },
  date: {
    fontSize: 17,
    color: "black",
  },
  room: {
    color: "black",
    fontSize: 20,
    flex: 2,
    textAlign: "center",
    fontStyle: 'italic',
    textAlignVertical: "center"
  }
});

AppRegistry.registerComponent('EpiToken', () => EpiToken);
