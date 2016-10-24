import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

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
            placeholder="Entrer son token"
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

const styles = StyleSheet.create({
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
