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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

import credentials from './credentials.json'

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

const sectionContent = ["Aujourd'hui", "Demain", "7 Jours", "30 Jours"]
const sectionsID = sectionContent.map((s, id) => id)

const getStartDate = () => "2015-10-01"
const getEndDate = () => {
  const start = new Date(getStartDate())
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30)
  return end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate()
}
const getNowDate = () => getStartDate()

export class Activitie extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {activitie, section} = this.props 
    const date = new Date(activitie.start.split(' ')[0])
    return (
      <View style={styles.activitieContainer}>
        <View style={{flex: 8}}>
          <Text style={styles.activitieTitle}>{activitie.acti_title}</Text>
          <Text style={styles.moduleTitle}>{activitie.titlemodule}</Text>
          {section > 1 ?
            <Text style={styles.date}>{days_name[date.getDay()]} {date.getDate()} {month_name[date.getMonth()]}</Text>
            : null
          }
        </View>
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


export default class EpiToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activities: []
    }
    this.logIn(credentials.login, credentials.password)
  }

  componentWillMount() {
    this.loadActivities()
  }

  logIn = (log, pass) => {
   var data = new FormData();
   data.append("login", log)
   data.append("password", pass)
   const header = {
       method: "POST",
    body: data
   }
   fetch(apiRoot + "?format=json", header).then(res => res.json()).then(rep => console.log("Connected"))
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
    const myActivities = activitiesBrut.filter(act => (__DEV__) ? act.event_registered : act.event_registered === "registered")
    const out = sectionContent.map(e => [])
    const today = new Date(getNowDate())
    myActivities.forEach((act, id) => {
      const actDate = new Date(act.start.split(' ')[0])
      if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24) {
        out[0].push(act)
      } else if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24 * 2) {
        out[1].push(act)
      } else if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24 * 7) {
        out[2].push(act)
      } else {
        out[3].push(act)
      }
      
    })
    this.setState({activities: out})
   })
  }

  render() {
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (r1, r2) => r1 !== r2})
    return (
      <View style={styles.container}>
        {this.state.activities.length ? 
          <ListView
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRowsAndSections(this.state.activities, sectionsID)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) => 
              <Activitie activitie={rowData} section={sid}/>
            }
            renderSectionHeader={(data, id) => <Text style={styles.header}>{sectionContent[id]}</Text>
            }
          />
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
    backgroundColor: "#81d4fa",
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
  }
});

AppRegistry.registerComponent('EpiToken', () => EpiToken);
