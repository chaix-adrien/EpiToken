import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Dimensions,
  AsyncStorage,
  Text,
} from 'react-native';
import Grid from 'react-native-grid-component';
const apiRoot = "https://intra.epitech.eu/"


export default class ProjectCalendar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tasks: [],
      gridData: [],
    }
  }

  componentWillMount() {
    this.props.switchLoading(false)
    

    this.loadTask()
  }

  taskToGridData = (tasks) => {
    let lastTaskDate = new Date(Date.now())
    tasks.forEach(t => {
      const tDate = new Date(t.end_acti.split(' ')[0] + 'T' + t.end_acti.split(' ')[1])
      if (tDate.getTime() > lastTaskDate.getTime()) lastTaskDate = tDate
    })
    let firstTaskDate = new Date(Date.now())
    firstTaskDate = new Date(firstTaskDate.getFullYear(), firstTaskDate.getMonth(), firstTaskDate.getDate(), 0, 0, 0, 0)
    lastTaskDate = new Date(lastTaskDate.getFullYear(), lastTaskDate.getMonth(), lastTaskDate.getDate(), 0, 0, 0, 0)
    const out = []
    let first = true
    for (d = d = new Date(firstTaskDate.getFullYear(), firstTaskDate.getMonth(), firstTaskDate.getDate() - 1, 0, 0, 0, 0); d.getTime() <= lastTaskDate.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0)) {
      const day = d.getDay()
      if (first) {
        out.push({
          type: "date",
          date: d,
          display: "",
          style: {backgroundColor: "transparent", height: 0, width: 0}
        })
        first = false
      } else {
        out.push({
          type: "date",
          date: d,
          display: (d.getDate() === 1) ? d.toDateString().split(' ')[1] + " " + d.getDate() : d.getDate(),
          style: {
            color: (day === 0 || day === 6) ? "red" : "black",
            borderBottomWidth: (day === 0) ? 1 : 0,
          }
        })
      }
      tasks.forEach((t, id) => {
        const s = new Date(t.begin_acti.split(' ')[0] + "T00:00:00")
        s.setHours(0)
        const e = new Date(t.end_acti.split(' ')[0] + "T00:00:00")
        e.setHours(0)
        if (d.getTime() >= s.getTime() && d.getTime() <= e.getTime()) {
          out.push({
            type: "task",
            task: t,
            style: {backgroundColor: `hsl(${40 * id}, 70%, 50%)` , borderRadius: 2}
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
      rep = rep.slice(1)
      this.setState({tasks: rep, gridData: this.taskToGridData(rep)}, () => this.forceUpdate())
    })
  }

  drawGridDay = (data, id) => {
    if (data.type === "date") {
      return <Text key={id} style={[data.style, styles.item, styles.itemDate]}>{data.display}</Text>
    } else if (data.type === "task") {
      return <View style={[data.style, styles.item]} key={id}/>
    } else {
      return <View style={[{backgroundColor: "transparent", borderBottomWidth: 1, borderColor: "grey"}, styles.item]} key={id}/>
    }
  }

  render() {
    const col = (this.state.tasks.length) ? this.state.tasks.length + 1: 1
    return (
      <View style={{flexDirection: "row", flex: 1}}>
        <View style={{flex: 1, width: Dimensions.get("window").width / 3}}>
          <Text>SLT</Text>
        </View>
        <View style={{width: (col) * 30 + 30 + col * 2,
          maxWidth: (Dimensions.get("window").width / 3) * 2,
          borderLeftWidth: 2, borderColor: "black", elevation: 20, backgroundColor: "#EEEEEE"}}>
          <Grid
            style={{flex: 1}}
            renderItem={(data, i) => this.drawGridDay(data, i)}
            data={this.state.gridData}
            itemsPerRow={col}
          />
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
  }
});

//si pas de data
//clique sur event
