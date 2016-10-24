import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
  TextInput,
  AsyncStorage,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import PushNotification from 'react-native-push-notification';
import CheckBox from 'react-native-check-box'
import {notifTimes} from '../index.android.js'

export default class NotificationsOptions extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: true,
      loaded: false,
    }
  }

  componentWillMount() {
    this.props.switchLoading(false)
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
        style={styles.icon}
        onPress={() => this.props.switchNotification()}
        >
          <Icon
            name={(this.props.active) ? "bell" : "bell-slash"}
            size={70}
            color={(this.props.active) ? "#2196f3" : "grey"}
          />
        </TouchableOpacity>
          <Text style={{fontSize: 20, margin: 20, color: "black"}}>Notification actives:</Text>
          <View style={{flex: 1}}>
          {this.props.mounted ? 
            notifTimes.map((time, id) => 
              <CheckBox
              key={id}
              style={styles.checkbox}
              onClick={() => this.props.switchActiveTime(id)}
              isChecked={this.props.activeTime[id]}
              leftTextView={<Text style={{fontSize: 17, flex: 1, marginRight: 30}}>{time.name}</Text>}
              />
          ):null}
          </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
  },
  icon: {
    backgroundColor: "#EEEEEE",
    borderRadius: 4,
    elevation: 10,
    padding: 10
  },
  checkbox: {
    marginTop: 5,
    width: 110,
  },
})
