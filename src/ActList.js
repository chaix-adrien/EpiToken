import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  View,
  Dimensions,
  RefreshControl,
  Alert,
  AsyncStorage,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

import {ActivitieToken, Activitie} from './Activitie.js'

const apiRoot = "https://intra.epitech.eu/"
const sectionContent = ["MAINTENANT", "TOKEN", "Aujourd'hui", "Demain", "7 Jours", "30 Jours"]
const sectionsID = sectionContent.map((s, id) => id)
const sectionColor = ["#8bc34a", "#EF5350", "#81d4fa", "#81d4fa", "#81d4fa", "#81d4fa"]

const getNowDate = () => {
  const start = new Date(Date.now())
  if (__DEV__)
    return "2015-10-02T10:20:00"
  return start.toISOString()
}

const getStartDate = () => {
  const now = new Date(getNowDate())
  const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)
  return start.toISOString()
}

const getEndDate = () => {
  const start = new Date(getNowDate())
  const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30)
  return end.toISOString()
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

  getDayDiff = (d1, d2) => {
    if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate())
      return 0
    else if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() == d2.getMonth())
      return d1.getDate() - d2.getDate()
    else
      return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24))
  }


  setNotification = (act, minBefore) => {
    if (this.apiDatetoDate(act.start).getTime() - 1000 * 60 * minBefore > Date.now()) {
      PushNotification.localNotificationSchedule({
          largeIcon: "ic_launcher",
          smallIcon: "ic_launcher",
          bigText: "My big text that will be shown when notification is expanded",
          vibrate: true,
          title: act.acti_title,
          message: "My Notification Message",
          color: this.minToColor(minBefore),
          playSound: true,
          soundName: 'default',
          date: new Date(this.apiDatetoDate(act.start).getTime() - 1000 * 60 * minBefore),
      });
    }
  }

  activeNotification = (acts, refs, minBefore) => {
    acts.forEach(act => {
      const notif = refs.get(this.getTokenLink(act)) ? refs.get(this.getTokenLink(act)) : []
      if (!notif.length || notif.indexOf(minBefore) === -1) {
        this.setNotification(act, minBefore)
        notif.push(minBefore)
        refs.set(this.getTokenLink(act), notif)
      }
    })
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
      const actDate = new Date(act.start.split(' ')[0] + "T" + act.start.split(' ')[1])
      const actDateEnd = new Date(act.end.split(' ')[0] + "T" + act.end.split(' ')[1])
      if (today.getTime() < actDateEnd.getTime() && today.getTime() > actDate.getTime()) {
        out[sectionContent.indexOf("MAINTENANT")].push(act)
      } else if (act.allow_token) {
        out[sectionContent.indexOf("TOKEN")].push(act)
      } else if (actDate.getTime() < today.getTime()) {
        // ignore it
      } else if (this.getDayDiff(actDate, today) < 1) {
        out[sectionContent.indexOf("Aujourd'hui")].push(act)
      } else if (this.getDayDiff(actDate, today) < 2) {
        out[sectionContent.indexOf("Demain")].push(act)
      } else if (this.getDayDiff(actDate, today) < 7) {
        out[sectionContent.indexOf("7 Jours")].push(act)
      } else {
        out[sectionContent.indexOf("30 Jours")].push(act)
      }
    })
    this.props.activeNotification(myActivities)
    this.props.switchLoading(false)
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
        {(this.state.activities.some(e => e.length)) ?
          <ListView
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.loadActivities}/>}
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRowsAndSections(this.state.activities, sectionsID)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) => (sid === sectionContent.indexOf("TOKEN") ) ? <ActivitieToken sendToken={this.sendToken} activitie={rowData} />: <Activitie activitie={rowData} section={sid}/>}
            renderSectionHeader={(data, id) => (data.length) ? <Text style={[styles.header, {backgroundColor: sectionColor[id]}]}>{sectionContent[id]}</Text> : null}
          />
          :
          <View style={{width: Dimensions.get("window").width, margin: 10, padding: 10}}>
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
    textShadowColor: "rgba(0, 0, 0, 100)",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },
});
