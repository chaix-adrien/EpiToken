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
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Grid from 'react-native-grid-component';
import moment from 'moment';
import {apiToDate} from '../index.android.js'
import Drawer from 'react-native-drawer'
import Icon from 'react-native-vector-icons/FontAwesome';

const apiRoot = "https://intra.epitech.eu/"
const taskInfosHeight = 170
const {width} = Dimensions.get("window")

export class TextVert extends Component {
  getTextArray = (txt) => {
    const out = []
    for (let i = 0; i < txt.length; i++) {
      out.push(<Text key={i} {...this.props.textStyle}>{txt[i]}</Text>)
    }
    return out
  }

  render() {
    const {text} = this.props
    if (!text) return null
    return (
      <View {...this.props.containerStyle}>
        {this.getTextArray(text)}
      </View>
    )
  }
}

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
        display: (d.getDate() === 1) ?d.toDateString().split(' ')[1] + " " + d.getDate() : d.getDate(),
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
    out.push({
      type: "date",
      display: "",
      style: {},
    })
    tasks.forEach((t, id) => {
      out.push({type: "none"})
    })
    return out
  }

  getFileUrl = (t) => `${apiRoot}module/${t.scolaryear}/${t.codemodule}/${t.codeinstance}/${t.codeacti}/project/file/?format=json`

  loadFiles = (tasks) => Promise.all(tasks.map(t => fetch(this.getFileUrl(t)).then(r => r.json())))

  loadTask = () => {
    const today = new Date(2015, 11, 10, 12, 0, 0, 0 /*Date.now()*/)
    var data = new FormData();
    data.append("start", today.toISOString())
    data.append("end", today.toISOString())
    const header = {
     method: "POST",
     body: data
    }
    fetch(apiRoot + "module/board/?format=json", header).then(res => res.json())
    .then(rep => {
      if (!rep.length) {
        this.setState({loading: false})
        return
      }
      rep = rep.filter(t => t.registered)
      this.loadFiles(rep).then(files => {
        rep.forEach((task, id) => {
          task.files = files[id].map(f => {
            return {path: f.fullpath, name: f.title}
          })
        })
        this.setState({loading: false, tasks: rep, gridData: this.taskToGridData(rep)}, () => this.forceUpdate())
      })
    })
  }

  drawGridDay = (data, id) => {
    if (data.type === "date") {
      return (
        <View key={id} style={[styles.item, {width: 30, flexDirection: "row"}]}>
          <Text style={[data.style, styles.itemDate]}>{data.display}</Text>
        </View>
      )
    } else if (data.type === "task") {
      return <TouchableOpacity style={[data.style, styles.item]} key={id} onPress={() => {
        this.drawer.close()
        this.listTaskInfo.scrollTo({y: taskInfosHeight * (id - 1)})
      }}/>
    } else {
      return <View style={[{backgroundColor: "white"}, styles.item]} key={id}/>
    }
  }

  getIconFromFile = (file) => {
    const ext = file.split('.')[file.split('.').length - 1]
    if (file.split('.').length < 2) return "file-o"
    switch(ext) {
      case "c": return "file-code-o"
      case "ini": return "file-code-o"
      case "ini": return "file-code-o"
      case "txt": return "file-text-o"
      case "pdf": return "file-pdf-o"
      case "png": return "file-image-o"
      case "jpg": return "file-image-o"
      case "jpeg": return "file-image-o"
      case "tar": return "file-zip-o"
      case "zip": return "file-zip-o"
      case "gz": return "file-zip-o"
      case "mp3": return "file-audio-o"
      case "wav": return "file-audio-o"
    }
  }

  getPercentageTask = (s, e) => {
    const scale = e.getTime() - s.getTime()
    const today = new Date(Date.now())
    const prc = (today.getTime() - s.getTime()) / scale
    return ((width / 4) * 3) * prc
  }

  taskInfos = (task, id) => {
    const s = apiToDate(task.begin_acti)
    const e = apiToDate(task.end_acti)
    return (
      <View style={{height: taskInfosHeight, borderRadius: 10, flex: 1}}>
        <View style={{flex: 1, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: `hsl(${60 * id}, 70%, 70%)`}}>
          <View style={{flex: 1, elevation: 10, width: this.getPercentageTask(s, e), borderTopLeftRadius: 10, backgroundColor: `hsl(${60 * id}, 70%, 50%)`}} />
        </View>
        <View style={{flex: 8, backgroundColor: `hsl(${60 * id}, 70%, 95%)`}}>
          <Text numberOfLines={1} style={styles.infoTitle}>{task.acti_title}</Text>
          <Text numberOfLines={1} style={{marginLeft: 5}}>{task.title_module}</Text>
          <Text numberOfLines={1} style={styles.infoDates}>Debut: {moment(s).format('DD/MM/YYYY')}</Text>
          <Text numberOfLines={1} style={styles.infoDates}>Fin: {moment(e).format('DD/MM/YYYY-hh:mm')}</Text>
          <ScrollView horizontal={true}>
            {task.files ?
              task.files.map((file, i) => {
                return (
                  <TouchableOpacity key={i} onPress={() => Linking.openURL(apiRoot.slice(0, -1) + file.path)}
                  style={{elevation: 5, backgroundColor: `hsl(${60 * id}, 70%, 60%)`, justifyContent: "center", alignItems: "center", width: 40, height: 40, borderRadius: 5, margin: 5}}
                  onLongPress={() => Linking.openURL(apiRoot.slice(0, -1) + file.path)}>
                  <Icon name={this.getIconFromFile(file.name)} size={30} color={`hsl(${60 * id}, 70%, 20%)`} />
                  </TouchableOpacity>
                )
              })
              : null
            }
          </ScrollView>
        </View>
      </View>
    )
  }

  projectGrid = (col) => {
    return (
      <ScrollView style={{width: (col) * 30 + 30 + col * 2,
        maxWidth: (width / 4) * 3,
        borderLeftWidth: 2, borderColor: "black", elevation: 20}}>
        <View style={{height: 12}} />
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
      </ScrollView>
    )
  }

  infoList = () => {
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    return (
      <View style={{flex: 1}}>
        <View style={{height: 12}} />
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
    )
  }

  getProjectView = (col) => {
    if (!col) {
      return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <View style={{height: 12}} />
          <Text style={{fontSize: 25, fontWeight: "bold"}}>Aucun projet en cours.</Text>
          <Text style={{fontStyle: 'italic'}}>Tu peux réinstaller Hearthstone !</Text>
        </View>
      )
    }
    const gridW = ((col) * 30 + 30 + col * 2)
    let openOff = width - gridW
    console.log(openOff)
    openOff = (openOff < width / 4) ? (width / 4) : openOff
    console.log("then", openOff)
    return (
      <Drawer
        ref={e => (this.drawer = e)}
        type="displace"
        content={
          <View style={{flex: 1, backgroundColor: "white", alignItems: "flex-end"}}>
            {this.projectGrid(col)}
          </View>
        }
        side="right"
        panCloseMask={openOff}
        acceptTap={true}
        elevation={20}
        tapToClose={true}
        openDrawerOffset={openOff}
        panCloseMask={0.2}
        closedDrawerOffset={gridW > width / 2.5 ? width / 2.5 : gridW}
        tweenHandler={(ratio) => ({main: { opacity:(2-ratio)/2 }})}
      >
        <View style={{flex: 1}}>
          {this.infoList()}
        </View>
      </Drawer>
    )
  }

  render() {
    const col = (this.state.tasks.length) ? this.state.tasks.length + 1: 0
    return this.getProjectView(col);
  }
}


const styles = StyleSheet.create({
  item: {
    flex: 1,
    height: 30,
    margin: 1,
    elevation: 3,
  },
  itemDate: {
    flex: 1,
    textAlign: "right",
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 17,
    borderColor: "grey",
  },
  infoTitle: {
    color: "black",
    fontWeight: "bold",
    fontSize: 23,
    marginLeft: 5,
  },
  infoDates: {
    color: "black",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 5,
  },
  fileText: {
    fontSize: 17,
    color: "black",

  },
  file: {
    margin: 5,
    borderRadius: 3,
    padding: 3,
    elevation: 5,
  }
});
