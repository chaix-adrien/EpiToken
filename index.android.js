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
  AsyncStorage,
  Text,
} from 'react-native';
import Keychain from 'react-native-keychain';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/FontAwesome'
import {DoubleBounce} from 'react-native-loader';
import PushNotification from 'react-native-push-notification';
import Popover from 'react-native-popover';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import ProjectCalendar from './src/ProjectCalendar.js'
import NotificationsOptions from './src/NotificationsOptions.js'
import LogWindow from './src/LogWindow.js'
import ActList from './src/ActList.js'
const apiRoot = "https://intra.epitech.eu/"

export const apiToDate = (str) => {
  d = str.split(" ")[0]
  h = str.split(" ")[1]
  return new Date(d.split('-')[0], d.split('-')[1] - 1, d.split('-')[2], ...h.split(":"), 0)
}

export const notifTimes = [
  {
    name: "5 min",
    time: 5,
    default: false,
  },
  {
    name: "15 min",
    time: 15,
    default: true,
  },
  {
    name: "30 min",
    time: 30,
    default: false,
  },
  {
    name: "1 h",
    time: 60,
    default: false,
  },
]


export default class EpiToken extends Component {
  constructor(props) {
    super(props)
    this.state = {
      mounted: false,
      loged: false,
      loading: true,
      waiting: false,
      notificationActive: true,
      notificationActiveTime: notifTimes.map(t => t.default),
      displayNotifOption: false,
      currentView: 0,
    }
    this.loadedAct = []
    this.tryToLogOnMount = true
  }

  componentWillMount() {
    AsyncStorage.getItem('@EpiToken:notificationActive', (e, res) => {
      if (res) {
        switch (res) {
          case "true": this.setState({notificationActive: true}); break
          case "false": this.setState({notificationActive: false}); break
        }
      }
    })
    AsyncStorage.getItem('@EpiToken:notificationActiveTime', (e, res) => {
      if (!res) {
        AsyncStorage.setItem('@EpiToken:notificationActiveTime', JSON.stringify(this.state.notificationActiveTime))
        this.setState({mounted: true})
      } else {
        this.setState({notificationActiveTime: JSON.parse(res), mounted: true})
      }
    })
  }

  logedIn = () => {
    this.tryToLogOnMount = false
    this.setState({loged: true})
  }

  switchLoading = (to) => {
    this.setState({loading: to})
  }

  switchWaiting = (to) => {
    this.setState({waiting: to})
  }

  logOut = () => {
   const header = {
       method: "POST",
   }
   PushNotification.cancelAllLocalNotifications()
   AsyncStorage.removeItem('@EpiToken:refsNotifications')
   Keychain.setGenericPassword("UNDEFINED", "UNDEFINED")
   this.setState({loged: false})
   return fetch(apiRoot + "/logout?format=json", header).then(res => res.json()).catch(e => null)
  }

  getTokenLink = (act) => {
    return `${apiRoot}/module/${act.scolaryear}/${act.codemodule}/${act.codeinstance}/${act.codeacti}/${act.codeevent}/token?format=json`
  }

  switchNotification = () => {
    if (this.state.notificationActive) {
      PushNotification.cancelAllLocalNotifications()
      AsyncStorage.removeItem('@EpiToken:refsNotifications')
    } else {
      this.activeNotification(this.loadedAct)
    }
    AsyncStorage.setItem('@EpiToken:notificationActive', (!this.state.notificationActive) ? "true" : "false")
    this.setState({notificationActive: !this.state.notificationActive})
  }

  switchActiveTime = (id) => {
    const newActiveTime = this.state.notificationActiveTime.slice(0)
    newActiveTime[id] = !newActiveTime[id]
    if (this.state.notificationActive) {
      PushNotification.cancelAllLocalNotifications()
      AsyncStorage.removeItem('@EpiToken:refsNotifications', () => this.activeNotification(this.loadedAct))
    }
    AsyncStorage.setItem('@EpiToken:notificationActiveTime', JSON.stringify(newActiveTime))
    this.setState({notificationActiveTime: newActiveTime})
  }


  setNotification = (act, minBefore) => {
    const minToColor = (min) => {
      if (min > 10) return "#33691e"
      else if (min > 5) return "#ffc107"
      else return "#d50000"
    }
    let room = act.room.code.split('/')
    room = room[room.length - 1]
    if (apiToDate(act.start).getTime() - 1000 * 60 * minBefore > Date.now()) {
      PushNotification.localNotificationSchedule({
          largeIcon: "ic_launcher",
          smallIcon: "ic_launcher",
          vibrate: true,
          title: act.acti_title,
          message: room + "  " + act.start.split(' ')[1].split(':').slice(0, 2).join(':') + " -> " + act.end.split(' ')[1].split(':').slice(0, 2).join(':'),
          color: minToColor(minBefore),
          playSound: true,
          soundName: 'default',
          date: new Date(apiToDate(act.start).getTime() - 1000 * 60 * minBefore),
      });
    }
  }

  activeNotification = (acts) => {
    this.loadedAct = acts
    AsyncStorage.getItem('@EpiToken:refsNotifications', (e, res) => {
      const refs = res ? new Map(JSON.parse(res)) : new Map()
      this.state.notificationActiveTime.forEach((doit, id) => {
        if (!doit) return
        acts.forEach(act => {
          const notif = refs.get(this.getTokenLink(act)) ? refs.get(this.getTokenLink(act)) : []
          if (!notif.length || notif.indexOf(notifTimes[id].time) === -1) {
            this.setNotification(act, notifTimes[id].time)
            notif.push(notifTimes[id].time)
            refs.set(this.getTokenLink(act), notif)
          }
        })
        AsyncStorage.setItem('@EpiToken:refsNotifications', JSON.stringify([...refs]))
      })
    })
  }

  ActionButton = () => {
    if (this.state.loading || !this.state.loged) return null
    return (
      <ActionButton
        icon={<Icon name="gear" size={20} color="white"/>}
        buttonColor="grey"
        offsetX={-20}
        offsetY={-36}
        style={{width: 10}}
        outRangeScale={0.8}
      >
        <ActionButton.Item buttonColor='#03a9f4' title={!this.state.currentView ? "Projets" : "Activités"} onPress={() => this.setState({currentView: this.state.currentView ? 0 : 1})}>
          <Icon name={!this.state.currentView ? "code-fork" : "calendar"} size={30}/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#cddc39' title="Notifications" onPress={() => this.setState({displayNotifOption: true})}>
          <Icon name="bell" size={30}/>
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#EF5350' title="Log Out" onPress={() => this.logOut()}>
          <Icon name="sign-out" size={30}/>
        </ActionButton.Item>
      </ActionButton>
    )
  }

  displayLoadingScreen = () => {
    if (!this.state.loading) return null
    return (
      <View style={styles.loading}>
        <DoubleBounce size={100} color="#FFF" />
        <Text style={{color: "white", fontStyle: "italic", marginTop: 5}}>Extracting your skillz</Text>
      </View>
    )
  }
  displayWaitingScreen = () => {
    if (!this.state.waiting || this.state.loading) return null
    return (
      <View style={[styles.loading, {backgroundColor: "transparent"}]}>
        <DoubleBounce size={100} color="#b3d4fc" />
        <Text style={{color: "white", fontStyle: "italic", marginTop: 5}}>Waiting for Awesomeness</Text>
      </View>
    )
  }

  getCurrentView = () => {
    if (!this.state.loged)
      return <LogWindow switchWaiting={this.switchWaiting} switchLoading={this.switchLoading} tryToLogOnMount={this.tryToLogOnMount} logedIn={this.logedIn}/>
    else if (this.state.displayNotifOption && false)
      return <NotificationsOptions
    activeTime={this.state.notificationActiveTime}
    active={this.state.notificationActive}
    switchLoading={this.switchLoading}
    mounted={this.state.mounted}
    switchNotification={this.switchNotification}
    switchActiveTime={this.switchActiveTime}
    />
    else
      return (
        <View style={styles.container}>
          <ScrollableTabView
          renderTabBar={() => <View/>}
          scrollOffset={400}
          locked={true}
          page={this.state.currentView}
          >
            <ActList tabLabel="Activités" activeNotification={this.activeNotification} switchWaiting={this.switchWaiting} switchLoading={this.switchLoading} />
            <ProjectCalendar tabLabel="Projets" switchWaiting={this.switchWaiting} switchLoading={this.switchLoading} />
          </ScrollableTabView>
        </View>
      )
  }

  render() {
    return (
      <View style={styles.container}>
        {this.getCurrentView()}
        {this.ActionButton()}
        {this.displayLoadingScreen()}
        {this.displayWaitingScreen()}
        <Popover
          placement="bottom"
          fromRect={{x: Dimensions.get('window').width / 2, y: Dimensions.get('window').height / 6, width: 0, height: 0}}
          isVisible={this.state.displayNotifOption}
          onClose={() => this.setState({displayNotifOption: false})}
        >
          <NotificationsOptions
          activeTime={this.state.notificationActiveTime}
          active={this.state.notificationActive}
          switchLoading={this.switchLoading}
          mounted={this.state.mounted}
          switchNotification={this.switchNotification}
          switchActiveTime={this.switchActiveTime}
          />
        </Popover>
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


//options :
  //theme
//Inscriptions
