$(document).ready(function(){


    const getMainDiv = (data)=>{
        data.forEach((e)=>{
            let div1 = document.createElement('div');
            $(div1).attr('class', 'col-lg-3 col-md-3 col-sm-3 col-xs-3');
            $(div1).attr('id', 'd'+e.id);
            let div2 = document.createElement('div');
            $(div2).attr('class', 'divs');
            $(div2).attr('id', e.name);
            div2.style.backgroundImage = 'url('+e.image+')';
            div2.style.opacity = 0.85;
            div2.style.backgroundSize = 'cover';
            let div3 = document.createElement('div');
            $(div3).attr('class', 'childDivs1');
            let playlistName = document.createElement('h3');
            $(playlistName).html(e.name);
            $('#allPlaylists').append(div1);
            $('#d'+e.id).append(div2);
            $('#'+e.name).append(div3);
            $('#'+e.name).append(playlistName);
            let span1 = document.createElement('span');
            let span2 = document.createElement('span');
            let span3 = document.createElement('span');
            $(span1).attr('class', 'glyphicon glyphicon-play');
            $(span2).attr('class', 'glyphicon glyphicon-pencil');
            $(span3).attr('class', 'glyphicon glyphicon-remove');
            $('#'+e.name).hover(()=>{
                $('#'+e.name).css('opacity', 1);
                $('#'+e.name).append(span1, span2, span3);
                $('.glyphicon-remove').click(()=>{
                    removePlaylist(e.name, e.id);
                });
                $('.glyphicon-pencil').click(()=>{
                    editPlaylist(e.name, e.id);
                });
                $('.glyphicon-play').click(()=>{
                    playPlaylist(e.name, e.id, e.songs);
                });
            }, ()=>{
                $('#'+e.name).css('opacity', 0.85);
                $('span').remove('.glyphicon');
            });
        });
    }


    const addPlaylistToDb = (arg1, arg2, songs)=>{
        let AddedPlaylist = {
            "name": arg1,
            "image": arg2,
            "songs":songs
        };
        $.ajax({
            type:'POST',
            url:'api/playlist',
            data: AddedPlaylist,
            success: function(data){
                location.reload();
            }
        });
    }


    const removePlaylist = (name, id)=>{
        $('#removePlaylistVerify').toggle();
        let verifyHeader = document.createElement('h4');
        verifyHeader.innerHTML = 'are you sure you what to remove the '+name+' playlist ??';
        $('#removePlaylistVerify').append(verifyHeader);
        $('#removePlaylist').click(()=>{
            $.ajax({
                type: 'DELETE',
                url:'api/playlist/'+id,
                dataType: 'JSON',
                success: function(data){
                    location.reload();
                }
            });
        });
        $('#dontRemovePlaylist').click(()=>{
            $('#removePlaylistVerify').toggle(verifyHeader);
        });
    }


    const editPlaylist = (name, id)=>{
        $('#editPlaylist').toggle();
        $.ajax({
            url:`api/playlist/`+id,
            type:'GET',
            contentType: "application/json; charset=utf-8",
            success:(data)=>{
                addParamToEditor(data.data);
            },
            error:(err)=>{
                console.error(err.responseText);
            }
        });
    }


    const addParamToEditor = (playlist)=>{
        $('#editPlaylist > #playlistImg').attr('src', playlist.image);
        $('#editPlaylist > #playlistName').attr('placeholder', playlist.name);
    }


    const playPlaylist = (name, id, songs)=>{
        $('title').html(name);
        $.ajax({
            url:`api/playlist/`+id+`/songs`,
            type:'GET',
            contentType: "application/json; charset=utf-8",
            success:(data)=>{
                addSongsToAudio(data.data.songs);
            },
            error:(err)=>{
                console.error(err.responseText);
            }
        });
        $('#mediaPlayer').show();
        $('#mediaPlayer').remove(span1, span2, span3);
        $('#mediaPlayer').hover(()=>{
            $('#d_play').css('opacity', 1);
            let span1 = document.createElement('span');
            let span2 = document.createElement('span');
            let span3 = document.createElement('span');
            $(span1).attr('class', 'glyphicon glyphicon-pause');
            $(span2).attr('class', 'glyphicon glyphicon-pencil');
            $(span3).attr('class', 'glyphicon glyphicon-remove');
            $('#mediaPlayer').append(span1, span2, span3);
            $('#mediaPlayer > .glyphicon-remove').click(()=>{
                $('#mediaPlayer').hide();
            });
        }, ()=>{
            $('#d_play').css('opacity', 0.85);
        });
    }


    const addSongsToAudio = (songs)=>{
        let audio = $("#audioTag")[0];
        $('#songsList').empty();
        for(let j=0;j<songs.length;j++){
            let txt = '<li id=li'+j+'>'+songs[j].name+'</li>';
            $('#songsList').append(txt);
        }
        audio.src = songs[0].url;
        $('#li'+0).wrap('<strong></strong>');
        let j=1;
        $('audio').on('ended', ()=>{

            $('#li'+(j-1)).unwrap('<strong></strong>');
            $('#li'+j).wrap('<strong></strong>');
            audio.src = songs[j].url;
            if(j<songs.length){
                j++;
            }
            audio.load();
        });
    }


    const songEnded = (song, index, audio)=>{
        let txt = '<li id=li'+index+'>'+song.name+'</li>';
        $('#songsList').append(txt);
        $('audio').on('ended', ()=>{
            audio.src = song.url;
            $('#li'+index).wrap('<strong></strong>');
            audio.pause();
            audio.load();
            audio.play();
        });
    }


    const init = ()=>{
        $('#addNewPlaylist').hide();
        $('#editPlaylist').hide();
        $('#removePlaylistVerify').hide();
        $('#addNewPlaylistSongs').hide();
        $('#mediaPlayer').hide();


        $.ajax({
            url:'api/playlist',
            type:'GET',
            data: 'JSON',
            success:(data)=>{
                getMainDiv(data.data);
            },
            error:(err)=>{

            }
        });


        $('#playlistUrl').keyup((e)=>{
            let imgId = $('#playlistImg');
            imgId.attr('src', $('#playlistUrl').val());
            $('#nextBtn').click((e)=>{
                $('#addNewPlaylistSongs').show();
            });
            $('#resetFields').click((e)=>{
                $('#playlistName').val('');
                $('#playlistUrl').val('');
            });
        });


        $('#addPlaylistToDb').click(()=>{
            let playlistName = $('#playlistName').val();
            let playlistUrl = $('#playlistUrl').val();
            let songs = [];
            for(let i=1;i<=3;i++){
                let sName = $('#songName'+i).val();
                let sUrl = $('#songUrl'+i).val();
                let s = {
                    'name':sName,
                    'url': sUrl
                }
                songs.push(s);
            }
            addPlaylistToDb(playlistName, playlistUrl, songs);
        });


        $('#addPlaylist').click((e)=>{
            $('#addNewPlaylist').toggle();
        });
    }


    init();


});//
