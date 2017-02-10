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
  Linking,
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
        <Text style={{fontSize: 20, flex: 0.8, fontWeight: "bold"}}>{module.title} </Text>
         <TouchableOpacity
            style={styles.registerButton}
            onPress={() => register(module)}
         >
         <Text style={{color: "white", fontWeight: "bold"}}>Register</Text>
          </TouchableOpacity>
       <TouchableOpacity
          style={{left: 4, top: -4}}
          onPress={() => {!isHidded ? hideModule(module) : showModule(module)}}
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


class ProjectRegisterable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      moreData: {}
    }
  }

  loadMore = () => {
    const {project} = this.props
    if (this.state.moreData.nb_min)
      return Promise.resolve(this.state.moreData)
    return myfetch(apiRoot + project.title_link + "project/?format=json")
    .then(data => {
      data.registered = []
      this.setState({moreData: data})
      return data
    })
  }

  onClick = () => {
    if (this.state.show) {
      this.setState({show: false})
    } else {
      this.loadMore().then(e => this.setState({show: true}))
    }
  }

  displayGroupData = () => {
    const {moreData} = this.state
    if (moreData.nb_min === 1 && moreData.nb_max === 1)
      return (<Text>Projet individuel</Text>)
    else
      return (<Text>Groupe de {moreData.nb_min} à {moreData.nb_max}</Text>)
  }

  displayRegisterButton = () => {
    const {project, register} = this.props
    const {moreData} = this.state
    if (moreData.nb_min === 1 && moreData.nb_max === 1) {
      return (
        <TouchableOpacity
        style={styles.registerButton}
        onPress={() => register(project)}
        >
          <Text style={{color: "white", fontWeight: "bold"}}>Register</Text>
        </TouchableOpacity>
      )
    }
    else if (moreData.nb_min === 1) {
      return (
        <View style={{flexDirection: "row", justifyContent: "center"}}>
          <TouchableOpacity
          style={styles.registerButton}
          onPress={() => register(project)}
          >
            <Text style={{color: "white", fontWeight: "bold"}}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={styles.registerButton}
          onPress={() => Linking.openURL(apiRoot + project.title_link + "project")}
          >
            <Text style={{color: "white", fontWeight: "bold"}}>Create Group</Text>
          </TouchableOpacity>
        </View>
      )
    }
    else {
      return (
        <TouchableOpacity
        style={styles.registerButton}
        onPress={() => Linking.openURL(apiRoot + project.title_link + "project")}
        >
          <Text style={{color: "white", fontWeight: "bold"}}>Create Group</Text>
        </TouchableOpacity>
      )
    }
  }

  render() {
    const {project, register, hideProject, isHidded, showProject} = this.props
    const {show, moreData} = this.state
    return (
      <TouchableOpacity style={styles.project} onPress={() => this.onClick()}>
        <View style={{flexDirection: "row"}} >
          <Text style={{fontSize: 20, flex: 0.8, fontWeight: "bold"}}>{project.title} </Text>
           <Icon
              name="long-arrow-right"
              size={20}
              color="#AAAAAA"
              style={{marginRight: 1}}
            />
            <Text>{project.timeline_end}</Text>
         <TouchableOpacity
            style={{left: 4, top: -4}}
            onPress={() => {!isHidded ? hideProject(project) : showProject(project)}}
         >
           <Icon
              name={!isHidded ? "times" : "eye"}
              size={20}
              color="#AAAAAA"
              style={{margin: 3, marginRight: 10, flex: 0.2}}
            />
          </TouchableOpacity>
        </View>
        {show ?
          <View>
            <Text>{moreData.module_title}</Text>
            <Text style={{margin: 5, fontStyle: 'italic'}}>{moreData.description}</Text>
            {this.displayGroupData()}
            <Text>Fin d'inscription: {moreData.end_register}</Text>
            {this.displayRegisterButton()}
          </View>
          : null
        }
      </TouchableOpacity>
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

  hideElem = (store, stateId, module, toast) => {
    if (toast)
      ToastAndroid.show('Module successfully hided.', ToastAndroid.SHORT);
    let newTab = this.state.hiddedModule.map(e => e);
    newTab.push(module)
    AsyncStorage.setItem(store, JSON.stringify(newTab))
    const state = {}
    state[stateId] = newTab
    this.setState(state)
  }

  showElem = (store, stateId, module) => {
    let newTab = this.state.hiddedModule.filter(mod => !(mod.title === module.title && mod.scolaryear === module.scolaryear))
    AsyncStorage.setItem(store, JSON.stringify(newTab))
    const state = {}
    state[stateId] = newTab
    this.setState(state)
  }

  isHidded = (key, mod) => this.state[key].some(m => m.title_link === mod.title_link)

  render() {
    const {module, hiddedModule, displayHiddenModule, displayHiddenProject, project} = this.state
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (r1, r2) => r1 !== r2})
    let moduleToDisplay = (displayHiddenModule) ?  module : module.filter(mod => !this.isHidded("hiddedModule", mod))
    let projectToDisplay = (displayHiddenProject) ?  project : project.filter(mod => !this.isHidded("hiddedProject", mod))
    return (
      <View style={styles.container}>
        <View style={{height: 12, width: Dimensions.get("window").width}} />
        <View style={styles.titles}>
        <Text style={styles.titleText}>Modules</Text>
        <Switch
          onValueChange={(value) => this.setState({displayHiddenModule: value})}
          style={{marginBottom: 10}}
          value={this.state.displayHiddenModule}
        />
        </View>
        {(moduleToDisplay.length) ?
          <ListView
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRows(moduleToDisplay)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) =>
              <ModuleRegisterable
              module={rowData}
              showModule={(mod) => this.showElem("@Epitoken:hiddedModule", "hiddedModule", mod)}
              hideModule={(mod) => this.hideElem("@Epitoken:hiddedModule", "hiddedModule", mod, true)}
              isHidded={this.isHidded("hiddedModule", rowData)}
              register={this.registerToModule}
              />}
          />
          :
          <View style={{flex: 1, width: Dimensions.get("window").width, margin: 10, padding: 10, alignItems: 'center', justifyContent: "center"}}>
            <Text style={{fontSize: 25, fontWeight: "bold"}}>Aucun nouveau module.</Text>
          </View>
        }
        <View style={styles.titles}>
        <Text style={styles.titleText}>Projets</Text>
        <Switch
          onValueChange={(value) => this.setState({displayHiddenProject: value})}
          style={{marginBottom: 10}}
          value={this.state.displayHiddenProject}
        />
        </View>
        {(projectToDisplay.length) ?
          <ListView
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRows(projectToDisplay)}
            enableEmptySections={true}
            renderRow={(rowData, sid, id) =>
              <ProjectRegisterable
              project={rowData}
              showProject={(proj) => this.showElem("@Epitoken:hiddedProject", "hiddedProject", proj)}
              hideProject={(proj) => this.hideElem("@Epitoken:hiddedProject", "hiddedProject", proj, true)}
              isHidded={this.isHidded("hiddedProject", rowData)}
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
  },
  project: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
    marginTop: 4,
    marginBottom: 2,
    backgroundColor: "white",
    padding: 5,
    elevation: 5,
  },
  registerButton: {
    padding: 4,
    borderRadius: 5,
    backgroundColor: "#666666",
    margin: 5,
    elevation: 2,
    alignSelf: "center",
  },
  titles : {
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#81d4fa",
    padding: 5,
    margin: 5,
    padding: 5,
    elevation: 5,
    borderRadius: 5,
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "black",
    marginLeft: 5,
    textShadowColor: "rgba(0, 0, 0, 100)",
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 5,
  },
});


//popup quand clic sur module:
//credit / projets / cours

//projets: afficher nom de module : projet / date end
//au clic: afficher credit / button register / nb groupe (si min > 1, pas afficher bouton register ou rediriger vers la page interent)
//afficher date finale pour inscription des projets
//date de rendu
