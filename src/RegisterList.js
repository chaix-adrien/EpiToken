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
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import PubSub from 'pubsub-js'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import {ActivitieToken, Activitie} from './Activitie.js'
import {apiToDate, myfetch} from '../index.android.js'

const apiRoot = "https://intra.epitech.eu/"

function register(link) {
  const header = {method: 'POST'}
  return myfetch(apiRoot + link, header)
  .then(rep => {
    ToastAndroid.show('Successfully registered.', ToastAndroid.SHORT); 
    PubSub.publish('register', link);
    return true
  }).catch(e => {
    ToastAndroid.show('Sorry, unable to register.', ToastAndroid.SHORT);
    return false
  })
}

class ModuleMoreInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      moreData: {},
      loading: true,
    }
  }

  componentWillMount() {
    const {module} = this.props
    myfetch(apiRoot + module.title_link + "?format=json")
    .then(data => {
      data.registered = []
      this.setState({moreData: data, loading: false})
    })
  }

  render() {
    const {moreData, loading} = this.state
    const {module, reload} = this.props
    if (loading)
      return (
        <ActivityIndicator
        animating={true}
        style={{height: 80}}
        size="large"
        />
      )
    return (
      <View>
        <Text style={{margin: 5, fontStyle: 'italic'}}>{moreData.description}</Text>
        <Text>Credit{moreData.credits > 1 ? "s" : ""}: {moreData.credits}</Text>
        <Text>Fin d'inscription: {moreData.end_register}</Text>
        <Text>{"\n"}Projects: </Text>
        {moreData.activites.map((act, id) => {return (
          <View key={id}>
            <Text>{act.title}</Text>
            <View style={{flexDirection: "row"}}>
              <Text>   {act.start.split(' ')[0]}</Text>
               <Icon
                name="long-arrow-right"
                size={20}
                color="#AAAAAA"
                style={{marginRight: 2, marginLeft: 2}}
              />
              <Text>{act.end.split(' ')[0]}</Text>
            </View>
          </View>
        )})}
        <TouchableOpacity
        style={styles.registerButton}
        onPress={() => register(module.title_link + "register?format=json")
        .then(res => res ? reload() : null)}
        >
          <Text style={{color: "white", fontWeight: "bold"}}>Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class ActivitieMoreInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  render() {
    const {loading} = this.state
    const {activitie, reload} = this.props
    if (loading)
      return (
        <ActivityIndicator
        animating={true}
        style={{height: 80}}
        size="large"
        />
      )
    return (
      <View>
        <Text style={{margin: 5, fontStyle: 'italic'}}>Salle: {activitie.salle}</Text>
        <View style={{flexDirection: "row"}}>
          <Text>{activitie.timeline_start}</Text>
          <Text>  {activitie.timeline_end.split(", ")[1]}</Text>
        </View>
        <TouchableOpacity
        style={styles.registerButton}
        onPress={() => register(activitie.register_link + "?format=json")
        .then(res => res ? reload() : null)}
        >
          <Text style={{color: "white", fontWeight: "bold"}}>Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}


class ProjectMoreInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      moreData: {},
      loading: true,
    }
  }

  componentWillMount() {
    const {project} = this.props
    myfetch(apiRoot + project.title_link + "project/?format=json")
    .then(data => {
      data.registered = []
      this.setState({moreData: data, loading: false})
    })
  }

  displayGroupData = () => {
    const {moreData} = this.state
    if (moreData.nb_min === 1 && moreData.nb_max === 1)
      return (<Text>Projet individuel</Text>)
    else
      return (<Text>Groupe de {moreData.nb_min} à {moreData.nb_max}</Text>)
  }

  displayRegisterButton = () => {
    const {project, reload} = this.props
    const {moreData} = this.state
    if (moreData.nb_min === 1 && moreData.nb_max === 1) {
      return (
        <TouchableOpacity
        style={styles.registerButton}
        onPress={() => register(project.title_link + "project/register?format=json")
        .then(res => res ? reload() : null)}
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
          onPress={() => register(project.title_link + "project/register?format=json")
          .then(res => res ? reload() : null)}
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
    const {moreData, loading} = this.state
    if (loading)
      return (
        <ActivityIndicator
        animating={true}
        style={{height: 80}}
        size="large"
        />
      )
    return (
      <View>
        <Text>{moreData.module_title}</Text>
        <Text style={{margin: 5, fontStyle: 'italic'}}>{moreData.description}</Text>
        {this.displayGroupData()}
        <Text>Fin d'inscription: {moreData.end_register}</Text>
        {this.displayRegisterButton()}
      </View>
    )
  }
}

class RegisterCell extends Component {
  constructor (props) {
    super(props)
    this.state = {
      show: false,
      moreData: {}
    }
    this.sub = null
  }

  componentWillMount() {
    this.sub = PubSub.subscribe("register", () => this.setState({show: false}))
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.sub)
  }

  render() {
    const {data, hideData, isHided, showData, moreDataDisplay} = this.props
    const {show, moreData} = this.state
    return (
      <TouchableOpacity style={styles.project} onPress={() => this.setState({show: !show})}>
        <View style={{flexDirection: "row"}} >
          <Text style={{fontSize: 20, flex: 0.8, fontWeight: "bold"}}>{data.title} </Text>
          <TouchableOpacity
          style={{left: 4, top: -4}}
          onPress={() => {!isHided ? hideData(data) : showData(data)}}
          >
            <Icon
            name={!isHided ? "times" : "eye"}
            size={20}
            color="#AAAAAA"
            style={{margin: 3, marginRight: 10, flex: 0.2}}
            />
          </TouchableOpacity>
        </View>
        {show ? moreDataDisplay(data) : null}
      </TouchableOpacity>
    )
  }
}

class RegisterTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hidedData: [],
      displayHidedData: false,
    }
  }

  componentWillMount() {
    AsyncStorage.getItem(this.props.hidedStore, (err, res) => {
      if (res)
        this.setState({hidedData: JSON.parse(res)})
    })
  }

  hideData = (toHide) => {
    const newTab = this.state.hidedData.map(e => e)
    newTab.push(toHide)
    AsyncStorage.setItem(this.props.hidedStore, JSON.stringify(newTab), () => {
      this.setState({hidedData: newTab})
    })
  }

  showData = (toShow) => {
    let newTab = this.state.hidedData.filter(hided => !this.props.isTheSame(hided, toShow))
    AsyncStorage.setItem(this.props.hidedStore, JSON.stringify(newTab), () => {
      this.setState({hidedData: newTab})
    })
  }

  render() {
    const {dataList, isTheSame, emptySentence, moreDataDisplay, loaded} = this.props
    const {displayHidedData, hidedData} = this.state
    if (loaded)
      AsyncStorage.setItem(this.props.lastStore, JSON.stringify(this.props.dataList))
    let listData = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (r1, r2) => r1 !== r2})
    let dataToDisplay = (displayHidedData) ? dataList : dataList.filter(dt => !hidedData.some(hided => isTheSame(hided, dt)))
    return (
      <ScrollView>
        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "flex-end"}}>
          <Text style={{fontSize: 15, top: -5}}>cachés: </Text>
          <Switch
          onValueChange={(value) => this.setState({displayHidedData: value})}
          style={{marginBottom: 10}}
          value={this.state.displayHidedData}
          />
        </View>
        {(dataToDisplay.length) ?
          <ListView
            style={{width: Dimensions.get("window").width}}
            dataSource={listData.cloneWithRows(dataToDisplay)}
            enableEmptySections={true}
            renderRow={(data, sid, id) =>
              <RegisterCell
              data={data}
              hideData={this.hideData}
              showData={this.showData}
              isHided={hidedData.some(hided => isTheSame(hided, data))}
              moreDataDisplay={moreDataDisplay}
              />
            }
          />
          :
          <View style={{flex: 1, width: Dimensions.get("window").width, margin: 10, padding: 10, alignItems: 'center', justifyContent: "center"}}>
            <Text style={{fontSize: 25, fontWeight: "bold"}}>{emptySentence}</Text>
          </View>
        }
      </ScrollView>
    )
  }
}

export default class RegisterList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      module: [],
      lastModules: [],
      project: [],
      lastProjects: [],
      activitie: [],
      lastActivities: [],
      loaded: false,
    }
    this.sub = null
  }

  componentWillMount() {
    AsyncStorage.multiGet(["@Epitoken:lastModules", "@Epitoken:lastProjects", "@Epitoken:lastActivities"], (err, res) => {
      let lastModules = []
      let lastProjects = []
      let lastActivities = []
      if (res[0][1])
        lastModules = JSON.parse(res[0][1])
      if (res[1][1])
        lastProjects = JSON.parse(res[1][1])
      if (res[2][1])
        lastActivities = JSON.parse(res[2][1])
      lastModules.forEach(mod => mod.timeline_barre = null)
      lastProjects.forEach(proj => proj.timeline_barre = null)
      lastActivities.forEach(act => act.timeline_barre = null)
      this.setState({lastModules: lastModules, lastProjects: lastProjects, lastActivities: lastActivities},
        () => this.loadAll())
    })
    this.sub = PubSub.subscribe("register", () => this.loadAll())
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.sub)
  }

  loadAll = () => {
    const header = {}   
    myfetch(apiRoot + "?format=json", header)
    .then(all => {
      let module = all.board.modules
      let project = all.board.projets.filter(p => p.date_inscription)
      let activitie = all.board.activites.filter(a => a.date_inscription)
      project.forEach(proj => proj.timeline_barre = null)
      module.forEach(mod => mod.timeline_barre = null)
      activitie.forEach(act => act.timeline_barre = null)
      this.setState({module: module, activitie: activitie, project: project, loaded: true})
    })
  }

  render() {
    const {activitie, lastActivities, module, lastModules, project, lastProjects, loaded} = this.state
    return (
      <View style={styles.container}>
        <View style={{height: 12, width: Dimensions.get("window").width}} />
        <ScrollableTabView
        initialPage={2}
        tabBarActiveTextColor="#51b4da"
        tabBarUnderlineStyle={{backgroundColor: "#51b4da"}}
        tabBarTextStyle={{fontSize: 15}}
        >
          <RegisterTab
          dataList={module}
          isTheSame={(mod1, mod) => mod1.title_link === mod.title_link}
          emptySentence="Aucun nouveau module."
          hidedStore="@Epitoken:hidedModule"
          lastStore="@Epitoken:lastModules"
          moreDataDisplay={(data) => <ModuleMoreInfo module={data} reload={this.loadAll}/>}
          tabLabel={"Modules" + (JSON.stringify(module) !== JSON.stringify(lastModules) ? " (NEW)" : "")}
          loaded={loaded}
          />
          <RegisterTab
          dataList={project}
          isTheSame={(act1, act) => act1.title_link === act.title_link}
          hidedStore="@Epitoken:hidedProject"
          lastStore="@Epitoken:lastProjects"
          emptySentence="Aucun nouveau projet."
          moreDataDisplay={(data) => <ProjectMoreInfo project={data} reload={this.loadAll}/>}
          tabLabel={"Projets" + (JSON.stringify(project) !== JSON.stringify(lastProjects) ? " (NEW)" : "")}
          loaded={loaded}
          />
          <RegisterTab
          dataList={activitie}
          isTheSame={(act1, act) => act1.register_link === act.register_link}
          emptySentence="Aucune nouvelle activité."
          hidedStore="@Epitoken:hidedActivitie"
          lastStore="@Epitoken:lastActivities"
          moreDataDisplay={(data) => <ActivitieMoreInfo activitie={data} reload={this.loadAll}/>}
          tabLabel={"Activités" + (JSON.stringify(activitie) !== JSON.stringify(lastActivities) ? " (NEW)" : "")}
          loaded={loaded}
          />
        </ScrollableTabView>
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
