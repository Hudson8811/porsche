$(document).ready(function () {
	window.auth = function (data) {
		$.ajax({
			type: "POST",
			url: "/authorize/",
			data: data,
			success: function(data) {
				if (data.length > 0) {
					checkAuth();
				}
			},
			error: function () {
				alert('Ошибка авторизации для продолжения');
			}
		});
	};

	function checkAuth() {
		$.ajax({
			type: "POST",
			url: "/get_hashcode/",
			success: function(data) {
				if (JSON.parse(data).hashcode != '' && JSON.parse(data).hashcode != undefined) {
					hash = JSON.parse(data).hashcode;

					$('.social').each(function () {
						var url = $(this).data('url');
						url += '&u='+encodeURIComponent(hash);
						$(this).attr('data-url', url);
					});
				}
			}
		});
	}
	//checkAuth();

	var socialTypes =  {
		"fb": "http://www.facebook.com/share.php?u=",
		"vk": "http://vkontakte.ru/share.php?url=",
		"tw": "https://twitter.com/intent/tweet?url=",
		"ok": "http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl=",
	};

	function getMeta(name) {
		var meta = $('meta[property="og:'+name+'"]');
		return meta.length ? meta.attr('content') : '';
	}

	$('.social__link').click(function() {
			var socialType;
			for (var name in socialTypes)
				if ($(this).hasClass(name)) { socialType = name; break; }
			if (socialType == undefined) return;

			var url = getMeta('url');
			var title = getMeta('title');
			var description = getMeta('description');
			var image = getMeta('image');

			var parent = $(this).closest('.social');
			var new_url = parent.attr('data-url');
			if (new_url) {
				url = new_url;
				image = '';
			}
			if (url == '') url = window.location.toString();

			var p_desc = parent.attr('data-description');
			if (p_desc) description = p_desc;
			var p_title = parent.attr('data-title');
			if (p_title) title = p_title;
			var p_image = parent.attr('data-image');
			if (p_image) image = p_image;

			var $slink = encodeURIComponent(url);
			switch (socialType) {
				case 'tw':
					$slink += '&text='+encodeURIComponent(title); break;
				case 'vk':
					if (image != '') $slink += '&image='+encodeURIComponent(image);
					if (title != '') $slink += '&title='+encodeURIComponent(title);
					if (description != '') $slink += '&description='+encodeURIComponent(description); break;
				case 'ok':
					if (image != '') $slink += '&st.imageUrl='+encodeURIComponent(image);
					if (description != '') $slink += '&st.comments='+encodeURIComponent(description); break;
				case 'fb':
					if (image != '') $slink += '&p[images][0]='+encodeURIComponent(image);
					if (title != '') $slink += '&p[title]='+encodeURIComponent(title);
					if (description != '') $slink += '&p[summary]='+encodeURIComponent(description); break;
			}

			if ($(this).data('mode') == 'nohash'){
				window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
			} else {
				if (hash === '') checkAuth();
				window.open(socialTypes[socialType]+$slink,socialType,'width=500,height=500,resizable=yes,scrollbars=yes,status=yes');
				afterShare(socialType);
			}
		}
	);

	function afterShare(social) {
		$.ajax({
			type: "POST",
			url: "/new_share/",
			data: { social_share : social },
			success: function(data) {
				console.log('share ok');
			}
		});
	}

	//////////////////

	anchorScroll($('.anchor'));

	function anchorScroll(e) {
		setTimeout(function () {
			e.click(function () {
				link = $(this).attr('href');
				to = $(link).offset().top;

				$('body, html').animate({
					scrollTop: to
				}, 800);
			});
		}, 100);
	}

	//////////////////

	$('.js-start').click(function () {
		curQuestion = 0;
		countQuestion = 1;
		points = 0;
		mixArray(allQuestions.test);
		countQuestion = allQuestions.test.length;
		curQuestion++;
		setQuestion(curQuestion, allQuestions);
		$('.current-step').text('01');
		$('.test--result').hide();
		$('#test').show();
	});

	////////////////

	curQuestion = 0;
	countQuestion = 1;
	points = 0;

	$.getJSON('quiz.json', function (data) {
		allQuestions = data;
		mixArray(allQuestions.test);
		countQuestion = allQuestions.test.length;
		curQuestion++;
		setQuestion(curQuestion, allQuestions);
	});

	$('.js-btn-option').click(function () {
		var choise = $(this).attr('data-option'),
			answer = allQuestions.test[curQuestion - 1].answer;

		if (allQuestions.test[curQuestion-1].correct === choise) {
			points++;
			$('.test__answer-text').html(answer.correct);
		} else {
			$('.test__answer-text').html(answer.incorrect);
		}

		$('.test__question').hide();
		$('.js-btn-option').hide();
		$('.test__answer').show();
		$('.js-btn-next').show();
	});

	$('.js-btn-next').click(function () {
		if (curQuestion < countQuestion) {
			curQuestion++;
			setQuestion(curQuestion, allQuestions);
			$('.current-step').text(curQuestion.toString().padStart(2,0));
			$('.test__progress-item--active').removeClass('test__progress-item--active').next().addClass('test__progress-item--active');
		} else {
			showResults(points);
		}
	});
});

function mixArray(arr) {
	var curIndex = arr.length, temp, randIndex;

	while (0 !== curIndex) {
		randIndex = Math.floor(Math.random() * curIndex);
		curIndex -= 1;
		temp = arr[curIndex];
		arr[curIndex] = arr[randIndex];
		arr[randIndex] = temp;
	}

	return arr;
}

function setQuestion(curQuestion, allQuestions) {
	var quest = allQuestions.test[curQuestion - 1],
		title = quest.question,
		answer = quest.answer,
		img = answer.img,
		optionFirst = quest.options.first,
		optionSecond = quest.options.second;

	$('.test__question').html(title);
	$('.test__answer > img').attr('src', img);
	$('.js-btn-option--1').text(optionFirst);
	$('.js-btn-option--2').text(optionSecond);

	$('.test__question').show();
	$('.test__answer').hide();
	$('.js-btn-option').show();
	$('.js-btn-next').hide();
}

function showResults(points) {
	$.getJSON('result.json', function (data) {
		var result = data.result,
				win;

		if (points > 5) {
			win = 2;
		} else if (points > 2) {
			win = 1;
		} else {
			win = 0;
		}

		$('.test').hide();
		$('.test--result').show();

		$('.test--result .test__heading').html(result[win].title);
		$('.test--result .container img').attr('src', result[win].img);
		$('.test--result .test__result-text').html(result[win].text);
	})
}
