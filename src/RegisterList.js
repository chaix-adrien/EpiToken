import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  View,
  Dimensions,
  RefreshControl,
  Alert,
  Switch,
  AsyncStorage,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

import {ActivitieToken, Activitie} from './Activitie.js'
import {apiToDate, myfetch} from '../index.android.js'

const apiRoot = "https://intra.epitech.eu/"

class ModuleRegisterable extends Component {
  render() {
    const {module, register, hideModule, isHidded, showModule} = this.props
    return (
      <View style={styles.module}>
        <Text style={{fontSize: 20, flex: 0.8}}>{module.title} </Text>
         <TouchableOpacity
          style={{padding: 4, borderRadius: 5, backgroundColor: "#666666", marginRight: 5}}
            onPress={() => register(module)}
         >
         <Text style={{color: "white", fontWeight: "bold"}}>Register</Text>
          </TouchableOpacity>
       <TouchableOpacity
          style={{left: 4, top: -4}}
          onPress={() => {!isHidded ? hideModule(module, true) : showModule(module)}}
       >
         <Icon
            name={!isHidded ? "times" : "eye"}
            size={20}
            color="#AAAAAA"
            style={{margin: 3, marginRight: 10, flex: 0.2}}
          />
        </TouchableOpacity>
      </View>
    )
  }
}

export default class RegisterList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      module: [],
      project: [],
      hiddedModule: [],
      hiddedProject: [],
      displayHiddenModule: false,
      displayHiddenProject: false,
      project: [],
      refreshing: true,
    }
  }

  componentWillMount() {
    this.loadAll()
  }

  loadAll = () => {
    const header = {}   
    myfetch(apiRoot + "?format=json", header)
    .then(all => {
      let module = all.board.modules
      let project = all.board.projets.filter(p => p.date_inscription)
      AsyncStorage.multiGet(["@Epitoken:hiddedModule", "@Epitoken:hiddedProject"], (err, res) => {
        let hiddedModule = []
        if (res[0][1])
          hiddedModule = JSON.parse(res[0][1])
        let hiddedProject = []
        if (res[1][1])
          hiddedProject = JSON.parse(res[1][1])
        this.setState({project: project, hiddedProject: hiddedProject, hiddedModule: hiddedModule, module: module, refreshing: false}, () => this.props.switchLoading(false))
      })
    })
  }

  registerToModule = (module) => {
   var data = new FormData();
    const header = {method: 'POST'}
    myfetch(apiRoot + module.title_link + "register?format=json", header)
    .then(rep => {
      ToastAndroid.show('Module successfully registered.', ToastAndroid.SHORT); 
      this.loadAll()
    }).catch(e => {
      ToastAndroid.show('Sorry, unable to register to this module.', ToastAndroid.SHORT);
    })
  }

  registerToProject = (project) => {
   var data = new FormData();
    const header = {method: 'POST'}
    myfetch(apiRoot + project.title_link + "project/register?format=json", header)
    .then(rep => {
      ToastAndroid.show('Project successfully registered.', ToastAndroid.SHORT); 
      this.loadAll()
    }).catch(e => {
      ToastAndroid.show(e, ToastAndroid.SHORT);
    })
  }

  hideModule = (module, toast) => {
    if (toast)
      ToastAndroid.show('Module successfully hided.', ToastAndroid.SHORT);
    let newTab = this.state.hiddedModule.map(e => e);
    newTab.push(module)
    AsyncStorage.setItem("@Epitoken:hiddedModule", JSON.stringify(newTab))
    this.setState({hiddedModule: newTab})
  }

  showModule = (module) => {
    let newTab = this.state.hiddedModule.filter(mod => !(mod.title === module.title && mod.scolaryear === module.scolaryear))
    AsyncStorage.setItem("@Epitoken:hiddedModule", JSON.stringify(newTab))
    this.setState({hiddedModule: newTab})

  }

  isHidded = (mod) => this.state.hiddedModule.some(m => m.title_link === mod.title_link)

  render() {
    const {module, hiddedModule, displayHiddenModule, displayHiddenProject, project} = this.state
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (r1, r2) => r1 !== r2})
    let moduleToDisplay = (displayHiddenModule) ?  module : module.filter(mod => !this.isHidded(mod))
    let projectToDisplay = (displayHiddenProject) ?  project : project.filter(mod => !this.isHidded(mod))
    return (
      <View style={styles.container}>
        <View style={{height: 12}} />
        <Text>Module</Text>
        <Switch
          onValueChange={(value) => this.setState({displayHiddenModule: value})}
          style={{marginBottom: 10}}
          value={this.state.displayHiddenModule}
        />
        {(moduleToDisplay.length) ?
          <ListView
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.loadAll}/>}
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRows(moduleToDisplay)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) =>
              <ModuleRegisterable
              module={rowData}
              showModule={this.showModule}
              hideModule={this.hideModule}
              isHidded={this.isHidded(rowData)}
              register={this.registerToModule}
              />}
          />
          :
          <View style={{flex: 1, width: Dimensions.get("window").width, margin: 10, padding: 10, alignItems: 'center', justifyContent: "center"}}>
            <Text style={{fontSize: 25, fontWeight: "bold"}}>Aucun nouveau module.</Text>
          </View>
        }
      <Text>Projets</Text>
        <Switch
          onValueChange={(value) => this.setState({displayHiddenProject: value})}
          style={{marginBottom: 10}}
          value={this.state.displayHiddenProject}
        />
        {(projectToDisplay.length) ?
          <ListView
            refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.loadAll}/>}
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRows(projectToDisplay)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) =>
              <ModuleRegisterable
              module={rowData}
              showModule={this.showModule}
              hideModule={this.hideModule}
              isHidded={this.isHidded(rowData)}
              register={this.registerToProject}
              />}
          />
          :
          <View style={{flex: 1, width: Dimensions.get("window").width, margin: 10, padding: 10, alignItems: 'center', justifyContent: "center"}}>
            <Text style={{fontSize: 25, fontWeight: "bold"}}>Aucun nouveau projet.</Text>
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
    borderRadius: 5,
    padding: 5,
    elevation: 20,
    fontWeight: "bold",
    fontSize: 30,
    color: "black",
    textShadowColor: "rgba(0, 0, 0, 100)",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },
  noActivities: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  noActivitiesButton: {
    padding: 20,
  },
  module: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
    marginTop: 4,
    marginBottom: 2,
    backgroundColor: "white",
    padding: 5,
    elevation: 5,
  }
});
