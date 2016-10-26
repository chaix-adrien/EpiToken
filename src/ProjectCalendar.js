import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Dimensions,
  AsyncStorage,
  Text,
  ListView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Grid from 'react-native-grid-component';
import moment from 'moment';
import {apiToDate} from '../index.android.js'

const apiRoot = "https://intra.epitech.eu/"
const taskInfosHeight = 180

export default class ProjectCalendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tasks: [],
      gridData: [],
      loading: true,
    }
  }

  componentWillMount() {
    this.loadTask()
  }

  taskToGridData = (tasks) => {
    let lastTaskDate = new Date(Date.now())
    tasks.forEach(t => {
      const tDate = apiToDate(t.end_acti)
      if (tDate.getTime() > lastTaskDate.getTime()) lastTaskDate = tDate
    })
    let firstTaskDate = new Date(Date.now())
    firstTaskDate = new Date(firstTaskDate.getFullYear(), firstTaskDate.getMonth(), firstTaskDate.getDate(), 0, 0, 0, 0)
    lastTaskDate = new Date(lastTaskDate.getFullYear(), lastTaskDate.getMonth(), lastTaskDate.getDate(), 0, 0, 0, 0)
    const out = []
    for (d = d = new Date(firstTaskDate.getFullYear(), firstTaskDate.getMonth(), firstTaskDate.getDate(), 0, 0, 0, 0); d.getTime() <= lastTaskDate.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0)) {
      const day = d.getDay()
        out.push({
          type: "date",
          date: d,
          display: (d.getDate() === 1) ? d.toDateString().split(' ')[1] + " " + d.getDate() : d.getDate(),
          style: {
            color: (day === 0 || day === 6) ? "red" : "black",
            borderBottomWidth: (day === 0) ? 1 : 0,
          }
        })
      tasks.forEach((t, id) => {
        const s = new Date(t.begin_acti.split(' ')[0] + "T00:00:00")
        s.setHours(0)
        const e = new Date(t.end_acti.split(' ')[0] + "T00:00:00")
        e.setHours(0)
        if (d.getTime() >= s.getTime() && d.getTime() <= e.getTime()) {
          out.push({
            type: "task",
            task: t,
            style: {backgroundColor: `hsl(${60 * id}, 70%, 50%)` , borderRadius: 2}
          })
        } else {
          out.push({type: "none"})
        }
      })
    }
    return out
  }

  loadTask = () => {
    const today = new Date(Date.now())
    var data = new FormData();
    data.append("start", today.toISOString())
    data.append("end", today.toISOString())
    const header = {
     method: "POST",
     body: data
    }
    fetch(apiRoot + "module/board/?format=json", header).then(res => res.json())
    .then(rep => {
      rep = rep.filter(t => t.registered)
      this.props.switchLoading(false)
      this.setState({loading: false, tasks: rep, gridData: this.taskToGridData(rep)}, () => this.forceUpdate())
    })
  }

  drawGridDay = (data, id) => {
    if (data.type === "date") {
      return <Text key={id} style={[data.style, styles.item, styles.itemDate]}>{data.display}</Text>
    } else if (data.type === "task") {
      return <TouchableOpacity style={[data.style, styles.item]} key={id} onPress={() => this.listTaskInfo.scrollTo({y: taskInfosHeight * (id - 1)})}/>
    } else {
      return <View style={[{backgroundColor: "transparent", borderBottomWidth: 1, borderColor: "grey"}, styles.item]} key={id}/>
    }
  }

  taskInfos = (task, id) => {
    const s = apiToDate(task.begin_acti)
    const e = apiToDate(task.end_acti)
    return (
      <View style={{height: taskInfosHeight, backgroundColor: `hsl(${60 * id}, 70%, 95%)`, borderRadius: 10}}>
        <View style={{height: 20, elevation: 5, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: `hsl(${60 * id}, 70%, 50%)`}} />
        <Text style={styles.infoTitle}>{task.acti_title}</Text>
        <Text style={{marginLeft: 5}}>{task.title_module}</Text>
        <Text style={styles.infoDates}>Debut: {"\n"}{moment(s).format('DD/MM/YYYY')}</Text>
        <Text style={styles.infoDates}>Fin: {"\n"}{moment(e).format('DD/MM/YYYY-hh:mm')}</Text>
      </View>
    )
  }

  render() {
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    const col = (this.state.tasks.length) ? this.state.tasks.length + 1: 1
    return (
      <View style={{flexDirection: "row", flex: 1}}>
        <View style={{flex: 1, width: Dimensions.get("window").width - ((col) * 30 + 30 + col * 2), minWidth: Dimensions.get("window").width / 3}}>
          {this.state.loading ?
            <ActivityIndicator animating={this.state.loading} style={[styles.centering, {height: 80}]} size="large" />
            :
            <ListView
            ref={e => (this.listTaskInfo = e)}
            dataSource={listData.cloneWithRows(this.state.tasks)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) => this.taskInfos(rowData, id)}
          />
        }
        </View>
        <View style={{width: (col) * 30 + 30 + col * 2,
          maxWidth: (Dimensions.get("window").width / 3) * 2,
          borderLeftWidth: 2, borderColor: "black", elevation: 20, backgroundColor: "#EEEEEE"}}>
          {this.state.loading ?
            <ActivityIndicator animating={this.state.loading} style={[styles.centering, {height: 80}]} size="large" />
            :
            <Grid
              style={{flex: 1}}
              renderItem={(data, i) => this.drawGridDay(data, i)}
              data={this.state.gridData}
              itemsPerRow={col}
            />
          }
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  item: {
    flex: 1,
    height: 30,
    margin: 1,
  },
  itemDate: {
    textAlign: "right",
    textAlignVertical: "center",
    fontWeight: "bold",
    width: 30,
    fontSize: 17,
    borderColor: "grey",
  },
  infoTitle: {
    color: "black",
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 5,
  },
  infoDates: {
    color: "black",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 5,
  }
});

//si pas de data
//Verifier les champs pour voir si tout les projet recu sont viable
