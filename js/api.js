function change(sel) {
	if(sel.value == "")
		sel.parentNode.classList.remove("input--filled");
	else
		sel.parentNode.classList.add("input--filled");

	search(sel.value,1);
}

function search(value, page) {
	//http://mobilecdn.kugou.com/api/v3/search/song?iscorrect=1&keyword=%E5%91%8A%E7%99%BD%E6%B0%94%E7%90%83&page=1&pagesize=2
	var size = 10;
	$.ajax({
		type: "GET",
		async: false,
		url: "http://songsearch.kugou.com/song_search_v2?keyword=" + value + "&page=" + page + "&pagesize=" + size + "&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0&_=1489023388641",
		dataType: "jsonp",
		jsonp: "callback",
		crossDomain: true,
		success: function(result) {
			if(page == 1)
				$('#music-list').empty();
			$('.li-load').remove();
			if(result.data.lists.length > 0) {
				for(i in result.data.lists) {
					//				<a href='javascript:void(0);' style='width:25px;height:25px;background: url(img/player_bg.png) no-repeat;background-position: -562px 0;'> </a>
					$('#music-list').append("<li><a href=javascript:play('" + result.data.lists[i].FileHash + "')>" + result.data.lists[i].FileName + "</a></li>");
				}
				page++;
				$('#music-list').append("<li class='li-load'><a href=javascript:search('" + value + "'," + page + ")>加载更多</a></li>");
			}
			else{
				$('#music-list').append("<li class='li-complete'><a href=javascript:void(0)>加载完毕</a></li>");
			}

		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(errorThrown);
		}
	});
}

/*function addToList(sel) {

	$('#play-list li').removeClass('active');
	if(sel.parents('ul').attr("id") == "music-list") {
		$('#play-list').append("<li>" + sel.parent().html() + "<a style='color:red;margin-left: 30px;' href='javascript:void(0)' onclick='removeFromList(this)'>删除</a></li>");
		index = $('#play-list').children().length - 1;
		$('#play-list li').eq(index - 1).addClass('active');
	} else if(sel.parents('ul').attr("id") == "play-list") {
		index = sel.parent().index();
		$('#play-list li').eq(index - 1).addClass('active');
	}
}*/

function removeFromList(sel) {
	event.stopPropagation();
	var index = sel.parents('li').index();
	ctx.playList.splice(index,1);
	sel.parents('li').remove();
	$('#playListCount').text(parseInt($('#playListCount').text())-1);
	localStorage.setItem("savedPlayList",JSON.stringify(ctx.playList));
}

//http://flc.io/music
// http://lib9.service.kugou.com/websearch/index.php?page={page}&keyword={keyword}&cmd=100&pagesize={pagesize}
// http://m.kugou.com/app/i/getSongInfo.php?hash={hash}&cmd=playInfo
//575A4DFC2B7C3D8CA0D8DAB0F4142EDE
function play(hash) {

	$.ajax({
		type: "GET",
		async: false,
		url: "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + hash,
		dataType: "jsonp",
		jsonp: "callback",
		crossDomain: true,
		success: function(result) {
			var song = {
				"playUrl": result.data.play_url,
				"audioName": result.data.audio_name,
				"authorName": result.data.author_name,
				"img": result.data.img,
				"lyrics": result.data.lyrics,
				"hash":hash
			};
/*			ctx.currentSong = song;
			ctx.updateSong();
			ctx.diskCovers[1].children('.album').attr('src', ctx.currentSong.img);
			ctx.play();*/
			
			ctx.playList.push(song);
			ctx.initPlayList();
			ctx.currentIndex = ctx.playList.length - 1;
			ctx.isPlaying = true;
			ctx.preSwitchSong();
			ctx.updateCoverState(0);
			ctx.updateSong();
			
			localStorage.setItem("savedPlayList",JSON.stringify(ctx.playList));
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(errorThrown);
		}
	});
	boardToggle();
}

function updateSongInfo(hash) {

	$.ajax({
		type: "GET",
		async: false,
		url: "http://www.kugou.com/yy/index.php?r=play/getdata&hash=" + hash,
		dataType: "jsonp",
		jsonp: "callback",
		crossDomain: true,
		success: function(result) {
			var song = {
				"playUrl": result.data.play_url,
				"audioName": result.data.audio_name,
				"authorName": result.data.author_name,
				"img": result.data.img,
				"lyrics": result.data.lyrics,
				"hash":hash
			};
			ctx.currentSong = song;
			ctx.playList[ctx.currentIndex] = song;
			localStorage.setItem("savedPlayList",JSON.stringify(ctx.playList));
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert(errorThrown);
		}
	});
}

function boardToggle(){
	if(document.getElementById('search-board').style.display=='none'){
		document.getElementById('search-board').style.display='block';
		document.getElementById('play-board').style.display='none';
	}
	else{
		document.getElementById('search-board').style.display='none';
		document.getElementById('play-board').style.display='block';
	}
}

function musicToggle(){
	if(ctx.lyrics != null && ctx.$playList.css('bottom') != '0px'){
		$('#lyrics-part').toggleClass('invisible');
	    $('#play-part').toggleClass('invisible');
	}
}

$('.fa-download').click(function(){
	event.stopPropagation();
	if(ctx.currentSong == undefined) return;
	var a=document.createElement("a");
	a.download = ctx.currentSong.audioName +'.mp3';
    a.innerHTML = '音乐下载链接';
	a.href = ctx.currentSong.playUrl;
	a.style.display = 'none';
	a.click();
	
});


$('.fa-comment').click(function(){
	event.stopPropagation();
	window.open('/chat.html');
});

document.getElementById("player").onerror = function() {
    updateSongInfo(ctx.currentSong.hash);
    ctx.updateSong();
};
