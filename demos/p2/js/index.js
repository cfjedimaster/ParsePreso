var PARSE_APP_ID = "av8jY0rm4qrXl3dBGLf9odznxbhuqHhiiH6s8Gxn";
var PARSE_JS_ID = "fGkzRRvEGxFwE7qG7aqI1eBKGWSPn2Q2pzqHTtZT";
var currentUser;
var NoteOb;

function init() {
	//This is based on an older PhoneGap demo, just force it for now...
    //document.addEventListener('deviceready', deviceready, false);
	deviceready();
}

function deviceready() {
	/*
    console.log("device ready to roll");
    if(navigator.connection.type === Connection.UNKNOWN ||
        navigator.connection.type === Connection.NONE) {
        //handle user being offline
    } else {
        console.log("Initialize Parse");
        appReady();
    }
	*/
	
	appReady();
}

function appReady() {
	console.log("appReady");
    Parse.initialize(PARSE_APP_ID,PARSE_JS_ID);

    NoteOb = Parse.Object.extend("Note");
    
    //Am I logged in already?
    currentUser = Parse.User.current();
    if(currentUser) {
        cylon.loadPage("./notes.html");
    }

    $(document).on("pageload", "#notesPage", function(e) {
        $("h1", this).append(currentUser.get("username"));

        getMyNotes();

        $("#newNoteForm").on("submit", function(e) {
            e.preventDefault();
            var text = $("#newNoteText").val();
            //if nothing, just ingnore
            if(text === "") return;

            var note = new NoteOb();
            note.set("text", text);
            note.set("creator", currentUser);
            note.setACL(new Parse.ACL(currentUser));

            note.save(null, {
                success:function(note) {
                    $("#newNoteText").val("");
                    getMyNotes();
                }, error:function(note, error) {
                    //Should have something nice here...
                }
            });
            console.log("about to add a new note");
        });

    });

    function getMyNotes() {
        var query = new Parse.Query(NoteOb);
        query.equalTo("creator", currentUser);
        query.find({
            success:function(notes) {
                var s = "";
                for(var i=0, len=notes.length; i<len; i++) {
                    s+= "<p>"+notes[i].get("text")+"</p>";
                }
                $("#currentNotes").html(s);
            }
        });
    }

    $(document).on("touchend","#registerForm", function(e) {
        e.preventDefault();

        $("#regstatus").html("").removeClass("errorDiv");

        //get values
        var username = $("#username").val();
        var password = $("#password").val();
        var email = $("#email").val();

        //do some basic validation here
        var errors = "";
        if(username === "") errors += "Username required.<br/>";
        if(password === "") errors += "Password required.<br/>";
        if(email === "") errors += "Email required.<br/>";

        if(errors !== "") {
            $("#regstatus").html(errors).addClass("errorDiv");
            return;
        }

        //try to register with Parse and see if it works.
        var user = new Parse.User();
        user.set("username", username);
        user.set("password", password);
        user.set("email", email);

        $("#regstatus").html("<b>Registering user...</b>");

        user.signUp(null, {
            success:function(user) {
                currentUser = user;
                cylon.loadPage("./notes.html");
            },
            error:function(user, error) {
                console.log("ERROR!");
                console.dir(error);
                $("#regstatus").html(error.message).addClass("errorDiv");
            }
        });
    });

    $(document).on("touchend","#loginForm", function(e) {
        e.preventDefault();

        $("#loginstatus").html("").removeClass("errorDiv");

        //get values
        var username = $("#username").val();
        var password = $("#password").val();

        //do some basic validation here
        var errors = "";
        if(username === "") errors += "Username required.<br/>";
        if(password === "") errors += "Password required.<br/>";

        if(errors !== "") {
            $("#loginstatus").html(errors).addClass("errorDiv");
            return;
        }

        $("#regstatus").html("<b>Logging in...</b>");

        Parse.User.logIn(username, password, {
            success:function(user) {
                currentUser = user;
                cylon.loadPage("./notes.html");
            },
            error:function(user, error) {
                console.log("ERROR!");
                console.dir(error);
                $("#loginstatus").html(error.message).addClass("errorDiv");
            }
        });
    });

    $(document).on("touchend","#resetForm", function(e) {
        e.preventDefault();
        var email = $("#passwordResetEmail").val();

        if(email === "") return;

        Parse.User.requestPasswordReset(email, {
            success:function() {
                alert("Reset instructions emailed to you.");
            },
            error:function(error) {
                alert(error.message);
            }
        });

    });

    $(document).on("touchend", "#logoutLink", function(e) {
        e.preventDefault();
        Parse.User.logOut();
        currentUser = null;
        cylon.loadPage("./index.html");
    });

}
