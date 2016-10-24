import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  View,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';

import {ActivitieToken, Activitie} from './Activitie.js'

const apiRoot = "https://intra.epitech.eu/"
const sectionContent = ["TOKEN", "Aujourd'hui", "Demain", "7 Jours", "30 Jours"]
const sectionsID = sectionContent.map((s, id) => id)


const getNowDate = () => {
  const start = new Date(Date.now())
  if (__DEV__)
    return "2015-10-01"
  return start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate()
}

const getStartDate = () => {
  const now = new Date(getNowDate())
  const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)
  return start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate()
}

const getEndDate = () => {
  const start = new Date(getNowDate())
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30)
  return end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate()
}

export default class ActList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activities: [],
      refreshing: true,
    }
  }

  componentWillMount() {
    this.loadActivities()
  }

  apiDatetoDate = (str) => {
    return new Date(str.split(' ')[0] + "T" + str.split(' ')[1])
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
    myActivities.sort((a, b) => {
      const dA = this.apiDatetoDate(a.start)
      const dB = this.apiDatetoDate(b.start)
      return dA.getTime() - dB.getTime()
    })
    myActivities.forEach((act, id) => {
      const actDate = new Date(act.start.split(' ')[0])
      if (__DEV__ && Math.random() < 0.1)
        act.allow_token = true
      if (act.allow_token) {
        out[0].push(act)
      } else if (actDate.getTime() < today.getTime()) {
        // ignore it
      }
      else if (actDate.getTime() - today.getTime() < 1000 * 60 * 60 * 24) {
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
        {(this.state.activities.some(e => e.length)) ?
          <ListView
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.loadActivities}/>}
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRowsAndSections(this.state.activities, sectionsID)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) => (sid === 0 ) ? <ActivitieToken sendToken={this.sendToken} activitie={rowData} />: <Activitie activitie={rowData} section={sid}/>}
            renderSectionHeader={(data, id) => (data.length) ? <Text style={[styles.header, {backgroundColor: id ? "#81d4fa" : "#EF5350"}]}>{sectionContent[id]}</Text> : null}
          />
          :
          <View>
            <Text style={styles.activitieTitle}>There is no activities for you !</Text>
              <Icon.Button name="refresh" backgroundColor="#3b5998" onPress={() => this.loadActivities()}>
                {"Reload the {INNOVATION.}"}
              </Icon.Button>
          </View>
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
});
