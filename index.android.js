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

import credentials from './credentials.json'

const apiRoot = "https://intra.epitech.eu/"




export default class EpiToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activities: []
    }
    this.logIn(cred.login, cred.password)
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
   data.append("start", "2015-12-14")
   data.append("end", "2015-12-14")
   const header = {
    method: "POST",
    body: data
   }
   fetch(apiRoot + "planning/load" + "?format=json", header).then(res => res.json())
   .then(activitiesBrut => {
    console.log("All activities:", activitiesBrut.length)
    const myActivities = activitiesBrut.filter(act => (__DEV__) ? act.event_registered : act.event_registered === "registered")
    console.log("my activities:", myActivities.length)
    this.setState({activities: myActivities})
   })
  }

  render() {
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    return (
      <View style={styles.container}>
        {this.state.activities.length ? 
          <ListView
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRows(this.state.activities)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) => 
              <Text>{rowData.acti_title}</Text>
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
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('EpiToken', () => EpiToken);
