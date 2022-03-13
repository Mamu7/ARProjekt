//###################################################################################################################################################
//###########   AR   ################################################################################################################################
//###################################################################################################################################################

$(document).ready(function() {
    $('#iframe').on( 'load', function() {
        var iframe = document.getElementById("iframe");
        var gltfentity = iframe.contentWindow.document.getElementById("a-entity");
        $('#car').click((e) => {
            gltfentity.setAttribute('gltf-model', '/gltf/car_model/scene.gltf');
            gltfentity.setAttribute('scale', '0.3 0.3 0.3');
            pos = 1;
        })
        $('#truck').click((e) => {
            gltfentity.setAttribute('gltf-model', '/gltf/truck_model/scene.gltf');
            gltfentity.setAttribute('scale', '0.3 0.3 0.3');
            pos = 2;
        })
        $('#old_building').click((e) => {
            gltfentity.setAttribute('gltf-model', '/gltf/old_building_model/scene.gltf');
            gltfentity.setAttribute('scale', '0.5 0.5 0.5');
            pos = 3;
        })
        $('#sofa').click((e) => {
            gltfentity.setAttribute('gltf-model', '/gltf/sofa_model/scene.gltf');
            gltfentity.setAttribute('scale', '0.8 0.8 0.8');
            pos = 4;
        })
    });
});

var objs = ["", "car", "truck", "old_building", "sofa"];
var pos = 0;

function nextSuggestion() {
  if(pos < objs.length -1) {
    pos++;
  }else {
    pos = 1;
  }
  setScene(objs[pos]);
}

function prevSuggestion() {
  if(pos > 1) {
    pos--;
  }else {
    pos = objs.length -1;
  }
  setScene(objs[pos]);
}

function setScene(obj) {
  if (obj == "car") {
    $('#car').click();
  } else if (obj == "truck") {
    $('#truck').click();
  } else if (obj == "old_building") {
    $('#old_building').click();
  } else if (obj == "sofa") {
    $('#sofa').click();
  }
}

//###################################################################################################################################################
//###########   VARIABLEN   #########################################################################################################################
//###################################################################################################################################################

var currentUserId = "";                   //Name des aktuell angemeldeten Users
var loggedIn = false;                     //Ist aktuell ein User eingelogged?
var currentSuggestionId = "";             //Name der aktuellen Suggestion
var currentSuggestionLiked = 0;           //Ist die aktuelle Suggestion geliked, gedisliked oder neutral?
var currentSuggestionLikes = 0;           //Anzahl Likes der aktuellen Suggestion
var currentSuggestionDislikes = 0;        //Anzahl Dislikes der aktuellen Suggestion
var currentSuggestionMeldungen = 0;       //Anzahl Meldungen der aktuellen Suggestion
var currentSuggestionGemeldet = 0;        //Ist die aktuelle Suggestion gemeldet?
var currentUserLikedPosts = [];           //Array, vom aktuellen User gelikte Suggestions
var currentUserDislikedPosts = [];        //Array, vom aktuellen User gedislikte Suggestions
var currentUserGemeldetPosts = [];        //Array, vom aktuellen User gemeldete Suggestions
var meldungenObergrenze = 10;             //Maximale Anzahl an Meldungen die eine Suggestion haben kann, bevor diese versteckt wird
var meldungenObergrenzeErreicht = false;  //Ist Obergrenze erreicht?
var postHidden = false;                   //Ist Suggestion versteckt?
var urlT = "https://localhost:3000/likes/"                            //Datenbanklink Likes
var urlUser = "https://localhost:3000/users/"                         //Datenbanklink User
//var urlT = "https://* IP *:3000/likes/"                             //Datenbanklink Likes mit IP
//var urlUser = "https://* IP *:3000/users/"                          //Datenbanklink User mit IP

const likebtn = document.getElementById("likebtn");                   //#######################################################
const dislikebtn = document.getElementById("dislikebtn");             //#
const csugg = document.getElementById("csugg");                       //#
const csugg2 = document.getElementById("csugg2");                     //#
const likeCounter = document.getElementById("likeCounter");           //#
const dislikeCounter = document.getElementById("dislikeCounter");     //#
const reportInfo = document.getElementById('reportInfo');             //#     HTML Elemente  für Zugriff speichern
const iframe = document.getElementById('iframe');                     //#
const wrapper = document.getElementById('wrapper');                   //#
const unameElement = document.getElementById("uname");                //#
const passElement = document.getElementById("pass");                  //#
const unameregElement = document.getElementById("unamereg");          //#
const passregElement = document.getElementById("passreg");            //#
const login_button = document.getElementById("login_button");         //#
const acc = document.getElementById("acc");                           //#
const reg_button = document.getElementById('reg_button');             //#
const id01 = document.getElementById("id01");                         //#
const id02 = document.getElementById("id02");                         //########################################################

function removeItemFromArray(array, item) {                           //Hilfsfunktion, entfernt Element aus Array
  var index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
}

String.prototype.hashCode = function(){                               //Einfache Hash Funktion
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = ((hash<<5)-hash)+char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

//###################################################################################################################################################
//#########   ALERTS   ##############################################################################################################################
//###################################################################################################################################################

function alertError(text) {              //Zeigt Error an
  Swal.fire({
    title: 'Error!',
    text: text,
    icon: 'error',
    confirmButtonText: 'OK'
  })
}

function alertInfo(text) {              //Zeigt Erfolg an
  Swal.fire({
    title: 'Erfolg!',
    text: text,
    icon: 'success',
    confirmButtonText: 'OK'
  })
}

function alertConfirmLogout(text) {     //Abfrage zur Bestätigung des Logouts
  Swal.fire({
    title: text,
    showDenyButton: true,
    confirmButtonText: 'Ja',
    denyButtonText: 'Nein',
  }).then((result) => {
    if(result.isConfirmed) {
      userLogout();
    }
  })
}

function alertConfirmMelden(text) {     //Abfrage zur Bestätigung des Meldens
  Swal.fire({
    title: text,
    showDenyButton: true,
    confirmButtonText: 'Ja',
    denyButtonText: 'Nein',
  }).then((result) => {
    if(result.isConfirmed) {
      melden();
    }
  })
}

function alertManyReports() {           //Zeigt Warnung an
  Swal.fire({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: "warning",
    title: "&#9888;Diese Suggestion wurde sehr oft gemeldet!&#9888;",
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)

 }})
}

//###################################################################################################################################################
//#########   AKTUALISIERUNG   ######################################################################################################################
//###################################################################################################################################################

function getCurrentSuggestion(currentSuggestion) {       //setzt aktuelle Suggestion, aktualisiert Anzeige und fragt Daten zu aktuellen Suggestion ab
  currentSuggestionId = currentSuggestion;
  csugg.innerHTML = "Aktuelle Suggestion: ";
  csugg2.innerHTML = currentSuggestionId;
  csugg2.style.padding = "0px";
  showPost();
  getCurrentData();
}

function getCurrentData() {             //fragt Datenbank zu Likes, Dislikes und Meldungen
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;

  var likeData;
  var currentLikeData;
  gLikes.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
      likeData = JSON.parse(this.responseText);
      for (var i = 0; i < likeData.length; i++) {
        if (likeData[i].name == currentSuggestionId) {
          currentLikeData = likeData[i];
        }
      }
      currentSuggestionLikes = currentLikeData.likes;
      currentSuggestionDislikes = currentLikeData.dislikes;
      currentSuggestionMeldungen = currentLikeData.meldungen;
      if (currentSuggestionMeldungen > meldungenObergrenze) {
        hidePost();
        meldungenObergrenzeErreicht = true;
      } else {
        if (postHidden) {
          showPost();
        }
      }
      updateUserActivity();
      setLikes();
      setMeldungen();
    }
    });
    var url = urlT;       //url, temp oder final
    gLikes.open("GET", url);
    gLikes.send();
}

//###################################################################################################################################################
//#########   LIKES & DISLIKES   ####################################################################################################################
//###################################################################################################################################################

function setLikes() {                                     //Ändert Farbe der Buttons, wenn diese gedrueckt wurden
  likeCounter.innerHTML =  currentSuggestionLikes;
  dislikeCounter.innerHTML = currentSuggestionDislikes;
  if (currentSuggestionLiked == 0) {
    likebtn.style.backgroundColor = "#909090"
    dislikebtn.style.backgroundColor = "#909090"
  }else {
    if (currentSuggestionLiked == 1) {
      likebtn.style.backgroundColor = "#0490FB"
      dislikebtn.style.backgroundColor = "#909090"
    }else {
      likebtn.style.backgroundColor = "#909090"
      dislikebtn.style.backgroundColor = "#0490FB"
    }
  }
}

function like() {                                                               //Like Funktion
  if (currentSuggestionId == "") {                                              //Nur moeglich wenn eine Suggestion ausgewählt ist
    alertError("Es ist kein Beitrag ausgewählt, der bewertet werden könnte!")
  }else {
    if (currentUserId != "") {                                                  //Nur möglich wenn ein User Angemeldet ist
      var gLikes = new XMLHttpRequest();
      gLikes.withCredentials = true;

      var newSuggestionLikes = 0;
      var newSuggestionDislikes = 0;
      if (currentSuggestionLiked == 0) {                                        //wenn neutral => fuegt Like hinzu
        newSuggestionLikes = currentSuggestionLikes + 1;
        newSuggestionDislikes = currentSuggestionDislikes;
        currentSuggestionLiked = 1;
        currentUserLikedPosts.push(currentSuggestionId);
      } else {
        if (currentSuggestionLiked == 1) {                                      //wenn geliked => entfernt Like
          newSuggestionLikes = currentSuggestionLikes - 1;
          newSuggestionDislikes = currentSuggestionDislikes;
          currentSuggestionLiked = 0;
          removeItemFromArray(currentUserLikedPosts, currentSuggestionId);
        } else {                                                                //wenn gedisliked => fuegt Like hinzu, entfernt Dislike
          newSuggestionLikes = currentSuggestionLikes + 1;
          newSuggestionDislikes = currentSuggestionDislikes - 1;
          currentSuggestionLiked = 1;
          currentUserLikedPosts.push(currentSuggestionId);
          removeItemFromArray(currentUserDislikedPosts, currentSuggestionId);
        }
      }
      var upd = { name: currentSuggestionId, likes: newSuggestionLikes, dislikes: newSuggestionDislikes, meldungen: currentSuggestionMeldungen };
      var upds = JSON.stringify(upd);

      gLikes.addEventListener("readystatechange", function() {
          if(this.readyState === 4) {                                           //aktualisiert Website
            currentSuggestionLikes = newSuggestionLikes;
            currentSuggestionDislikes = newSuggestionDislikes;
            setLikes();
            updateUser();
          }
        });
        var url = urlT;       //url, temp oder final
        gLikes.open("PUT", url);
        gLikes.setRequestHeader('Content-type', 'application/json');
        gLikes.send(upds);                                                      //aktualisiert Datenbank
    }else {
      alertError("Nur angemeldete Benutzer können Beiträge bewerten!");
    }
  }
}

function dislike() {                                                            //Like Funktion
  if (currentSuggestionId == "") {
    alertError("Es ist kein Beitrag ausgewählt, der bewertet werden könnte!")   //Nur moeglich wenn eine Suggestion ausgewählt ist
  }else {
    if (currentUserId != "") {                                                  //Nur möglich wenn ein User Angemeldet ist
      var gLikes = new XMLHttpRequest();
      gLikes.withCredentials = true;

      var newSuggestionLikes = 0;
      var newSuggestionDislikes = 0;
      if (currentSuggestionLiked == 0) {                                        //wenn neutral => fuegt Dislike hinzu
        newSuggestionDislikes = currentSuggestionDislikes + 1;
        newSuggestionLikes = currentSuggestionLikes;
        currentSuggestionLiked = -1;
        currentUserDislikedPosts.push(currentSuggestionId);
      } else {
        if (currentSuggestionLiked == 1) {                                      //wenn geliked => entfernt Like, fuege Dislike hinzu
          newSuggestionLikes = currentSuggestionLikes - 1;
          newSuggestionDislikes = currentSuggestionDislikes + 1;
          currentSuggestionLiked = -1;
          currentUserDislikedPosts.push(currentSuggestionId);
          removeItemFromArray(currentUserLikedPosts, currentSuggestionId);
        } else {                                                                //wenn gedisliked => entfernt Dislike
          newSuggestionLikes = currentSuggestionLikes;
          newSuggestionDislikes = currentSuggestionDislikes - 1;
          currentSuggestionLiked = 0;
          removeItemFromArray(currentUserDislikedPosts, currentSuggestionId);
        }
      }
      var upd = { name: currentSuggestionId, likes: newSuggestionLikes, dislikes: newSuggestionDislikes, meldungen: currentSuggestionMeldungen };
      var upds = JSON.stringify(upd);

      gLikes.addEventListener("readystatechange", function() {
          if(this.readyState === 4) {                                           //aktualisiert Website
            currentSuggestionLikes = newSuggestionLikes;
            currentSuggestionDislikes = newSuggestionDislikes;
            setLikes();
            updateUser();
          }
        });
        var url = urlT;       //url, temp oder final
        gLikes.open("PUT", url);
        gLikes.setRequestHeader('Content-type', 'application/json');
        gLikes.send(upds);                                                      //aktualisiert Datenbank
    }else {
      alertError("Nur angemeldete Benutzer können Beiträge bewerten!");
    }
  }
}

//###################################################################################################################################################
//#########   POST(TEST)   ##########################################################################################################################
//###################################################################################################################################################

function testPost() {                                                           //fuegt Datenbank eintrag hinzu
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;
  var testS = { name: 'sofa', likes: 25, dislikes: 3, meldungen: 2 };
  var testss = JSON.stringify(testS);
  gLikes.addEventListener("readystatechange", function() {
    });
    var url = urlT;       //url, temp oder final
    gLikes.open("POST", url);
    gLikes.setRequestHeader('Content-type', 'application/json');
    gLikes.send(testss);
}

//###################################################################################################################################################
//#######   MELDEN   ################################################################################################################################
//###################################################################################################################################################

function setMeldungen() {                                                       //Info zur Anzahl Meldungen
  if (currentSuggestionMeldungen > 0.8 * meldungenObergrenze && postHidden == false) {
    alertManyReports();
  }
}

function confirmMelden() {                                                      //Bestaetigt dass Meldung moeglich und gewollt ist
  if (currentSuggestionId == "") {
    alertError("Es ist kein Beitrag ausgewählt, der gemeldet werden könnte!")
  }else {
    if (currentUserId != "") {
      if (currentSuggestionGemeldet == 0) {
        alertConfirmMelden("Wollen Sie diesen Beitrag melden?");

      }else {
        alertError("Der Beitrag wurde bereits gemeldet!");
      }
    }else {
      alertError("Nur angemeldete Benutzer können Beiträge melden!");
    }
  }
}

function melden() {                                                             //fuegt Meldung hinzu
  currentSuggestionGemeldet = 1;
  currentUserGemeldetPosts.push(currentSuggestionId);
  updateMeldunen();
  updateUser();
  alertInfo("Der Beitrag wurde erfolgreich gemeldet!");
}


function updateMeldunen() {                                                     //aktualisiert Meldungen in Datenbank
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;

  var newSuggestionMeldungen = currentSuggestionMeldungen + 1;
  var upd = { name: currentSuggestionId, likes: currentSuggestionLikes, dislikes: currentSuggestionDislikes, meldungen: newSuggestionMeldungen };
  var upds = JSON.stringify(upd);

  gLikes.addEventListener("readystatechange", function() {
      if(this.readyState === 4) {
        currentSuggestionMeldungen = newSuggestionMeldungen;
      }
    });
    var url = urlT;       //url, temp oder final
    gLikes.open("PUT", url);
    gLikes.setRequestHeader('Content-type', 'application/json');
    gLikes.send(upds);
}

function hidePost() {                                                           //versteckt Suggestions die zu oft gemeldet wurden
  reportInfo.style.display='block';
  iframe.style.display='none';
  wrapper.style.display='none';
  postHidden = true;
}

function showPost() {                                                           //zeigt Suggestions
  iframe.style.display='block';
  wrapper.style.display='block';
  reportInfo.style.display='none';
  postHidden = false;
}

//###################################################################################################################################################
//#######   BINDUNG VON LIKESTATUS AN ACCOUNT #######################################################################################################
//###################################################################################################################################################

function updateUser() {                                                         //aktualisiert User Infos in Datenbank
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;

  var user = { username: currentUserId, liked_posts: currentUserLikedPosts, disliked_posts: currentUserDislikedPosts, gemeldet_posts: currentUserGemeldetPosts }
  var userS = JSON.stringify(user);

  gLikes.addEventListener("readystatechange", function() {
      if(this.readyState === 4) {
      }
    });
    var url = urlUser;       //url, temp oder final
    gLikes.open("PUT", url);
    gLikes.setRequestHeader('Content-type', 'application/json');
    gLikes.send(userS);
}

function updateUserActivity() {                                                 //aktualisiert User Infos auf Website
  if (currentUserId != "" && currentSuggestionId != "") {
    currentSuggestionLiked = 0;
    currentSuggestionGemeldet = 0;
    for (var i = 0; i < currentUserLikedPosts.length; i++) {
      if (currentSuggestionId == currentUserLikedPosts[i]) {
        currentSuggestionLiked = 1;
      }
    }

    for (var i = 0; i < currentUserDislikedPosts.length; i++) {
      if (currentSuggestionId == currentUserDislikedPosts[i]) {
        currentSuggestionLiked = -1;
      }
    }

    for (var i = 0; i < currentUserGemeldetPosts.length; i++) {
      if (currentSuggestionId == currentUserGemeldetPosts[i]) {
        currentSuggestionGemeldet = 1;
      }
    }
  } else {
    currentSuggestionLiked = 0;
    currentSuggestionGemeldet = 0;
  }
  setLikes();
}

//###################################################################################################################################################
//######  LOGIN  ####################################################################################################################################
//###################################################################################################################################################

function login() {                                                //Startet Login Prozess, ueberprueft ob Felder leer sind
  var uname = unameElement.value;
  var pass = passElement.value;
  if (uname == "" || pass == "") {
    alertError("Benutzername und Passwort notwendig!");
  }else {
    getUser(uname, pass);
  }
}

function getUser(uname, pass) {                                                 //Ueberprueft Login Daten, gibt User Infos aus Datenbank zurueck
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;

  var userData;
  var userExists = false;
  var passwordCorrect = false;
  var currentUserPos = -1;
  gLikes.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
      userData = JSON.parse(this.responseText);
      for (var i = 0; i < userData.length; i++) {
        if (userData[i].username == uname) {
          userExists = true;
          if (userExists && userData[i].password == pass.hashCode()) {
            passwordCorrect = true;
            currentUserPos = i;
          }
        }
      }
      if (userExists && passwordCorrect) {
        currentUserId = uname;
        loggedIn = true;
        loginLogout();
        closeLogin();
        currentUserLikedPosts = userData[currentUserPos].liked_posts;
        currentUserDislikedPosts = userData[currentUserPos].disliked_posts;
        currentUserGemeldetPosts = userData[currentUserPos].gemeldet_posts;
        updateUserActivity();
      }else {
        if (!userExists) {
          alertError("Benutzer existiert nicht!");
        }else {
          alertError("Passwort ist falsch!");
        }
      }
    }
    });
    var url = urlUser;       //url, temp oder final
    gLikes.open("GET", url);
    gLikes.send();
}

function userLogin() {                                                          //Oeffnet Login Fenster
  id01.style.display='block'
}

function closeLogin(){                                                          //Schliesst Login Fenster
  id01.style.display='none'
}

function confirmUserLogout() {                                                  //Bestaetigt, dass sich ein User ausloggen moechte
  alertConfirmLogout("Wollen Sie sich wirklich ausloggen");
}

function userLogout() {                                                         //Logged User aus
  currentUserId = "";
  loggedIn = false;
  unameElement.value = "";
  passElement.value = "";
  updateUserActivity();
  loginLogout();
}

function loginLogout() {                                                        //Wechsel zwischen Login/Logout Funktion
  if (loggedIn) {
    login_button.innerHTML = "Logout";
    acc.innerHTML = " Angemeldet als " + currentUserId;
    login_button.setAttribute( "onClick", "javascript: confirmUserLogout();");
    reg_button.style.display='none';
  }else {
    login_button.innerHTML = "Login";
    acc.innerHTML = "";
    login_button.setAttribute( "onClick", "javascript: userLogin();");
    reg_button.style.display='block';
  }
}

//###################################################################################################################################################
//#########   REGISTRIERUNG   #######################################################################################################################
//###################################################################################################################################################

function createUser() {                                                     //Startet Registrierungs Prozess, ueberprueft ob Felder leer sind
  var unamereg = unameregElement.value;
  var passreg = passregElement.value;
  if (unamereg == "" || passreg == "") {
    alertError("Benutzername und Passwort notwendig!");
  }else {
    usernameFree(unamereg, passreg);
    }
  }

function usernameFree(unamereg, passreg) {                                      //Prueft ob Benutzername frei ist, startet dann Account Erstellung
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;

  var userData;
  var usernameUsed = false;
  gLikes.addEventListener("readystatechange", function() {
    if(this.readyState === 4) {
      userData = JSON.parse(this.responseText);
      for (var i = 0; i < userData.length; i++) {
        if (userData[i].username == unamereg) {
          usernameUsed = true;
        }
      }
      if (usernameUsed == false) {
        createUserAcc(unamereg, passreg.hashCode());
      } else {
        alertError("Benutzername ist bereits vergeben!");
      }
    }
    });
    var url = urlUser;       //url, temp oder final
    gLikes.open("GET", url);
    gLikes.send();
}

function createUserAcc(unamereg, passreg) {                                     //erstellt Account
  var gLikes = new XMLHttpRequest();
  gLikes.withCredentials = true;

  var user = { username: unamereg, password: passreg, liked_posts: [], disliked_posts: [], gemeldet_posts: [] };
  var userS = JSON.stringify(user);

  gLikes.addEventListener("readystatechange", function() {
    closeRegister();
    });
    var url = urlUser;       //url, temp oder final
    gLikes.open("POST", url);
    gLikes.setRequestHeader('Content-type', 'application/json');
    gLikes.send(userS);
}

function register() {                                                           //Oeffnet Registrierungsfenster
  id02.style.display='block'
}

function closeRegister() {                                                      //Schliesst Registrierungsfenster
  id02.style.display='none'
}

//###################################################################################################################################################
//###################################################################################################################################################
//###################################################################################################################################################
