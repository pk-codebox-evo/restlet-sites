var cQualifiers;
var cEditions;
var cTypesDistribution;
var handleFragment = false;
var redirectDownload = false;

function getParameterByName(query, name, defaultValue) {
	var result = defaultValue;
	if (query) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[#\\?&]?" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(query);
		if (results != null) {
			result = decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	}
	return result;
}

function loadQualifiers() {
	cQualifiers.empty();
	for ( var i = 0; q = qualifiers[i]; i++) {
		cQualifiers.append('<li id="' + q.id + '">' + q.name + '</li>');
	};
	cQualifiers.children().click(function() {
		setQualifier(this.id);
		refresh();
	});
};
function loadEditions() {
	cEditions.empty();
	for ( var i = 0; edition = editions[i]; i++) {
		if ("all" != edition.id) {
			cEditions.append('<li id="' + edition.id + '">' + edition.longname
					+ '</li>');
		}
	};
	cEditions.children().click(function() {
		setEdition(this.id);
		refresh();
	});
};
function loadDistributions() {
	distribution = null;
	cTypesDistribution.empty();
	cTypesDistribution.append('<li id="zip">ZIP file</li>');
	cTypesDistribution.append('<li id="exe">Windows installer</li>');
	cTypesDistribution.append('<li id="maven">Maven</li>');
	cTypesDistribution.append('<li id="p2">Eclipse</li>');
	cTypesDistribution.children().click(function() {
		setDistribution(this.id);
		refresh();
	});
};

function setDownloadButton() {
	$('#download').empty();
	if (distribution && "file" == distribution.type) {
		// Update download button
		var urlChangesLog = "/learn/";
		if ("unstable" == qualifier.id) {
			urlChangesLog += "snapshot";
		} else {
			urlChangesLog += version.minorVersion;
		}
		urlChangesLog += "/changes";

		$('#download').append('<p><button id="download_rf" class="btn btn-large btn-success" type="button">Download ' + version.fullVersionCompact + '</button></p>');
		
		if (distribution.fileType !== "maven"
			&& distribution.fileType !== "p2") {
			$('#download').append('<p>File size: ' + distribution.fileSize + '</p>');			
		}
		$('#download').append('<p>Date: ' + version.published + '</p>');
		$('#download').append('<p><a href="' + urlChangesLog + '">What\'s new</a></p>');
		
		$('#downloadDocKinLane').click(
				function(event) {
					mixpanel.track("Shared email", {
						"email": $("#downloadDocKinLaneEmail").val(),
						"Email field location":"Kin Lane Guide"
					});
					mixpanel.alias($("#downloadDocKinLaneEmail").val(), mixpanel.get_distinct_id());
					mixpanel.people.set({"$email": $("#downloadDocKinLaneEmail").val()});
					mixpanel.track("Downloaded Kin Lane Guide");
					
					// close popup
					$("#downloadDocKinLaneEmail").val("");
					$("#deployModal").hide();

					// launch pdf download in a new tab
					window.open('http://restlet.files.wordpress.com/2013/12/gigaom-research-a-field-guide-to-web-apis.pdf?utm_source=restlet-site&utm_medium=popup&utm_campaign=Kin%20Lane%20Guide', "_blank");
				}
		);

		if (distribution.fileType == "maven") {
			$('#download_rf').click(
					function() {
						$('#eclipse_infos').css('display','none');
						$('#maven_infos').css('display','none');
						var hrefCallback = function() {
							$('#maven_infos').css('display','block');
							// open Kin Lane popup
							$("#deployModal").show();
						}
						
						// in case Mixpanel servers don't get back to us in time
						// we use the same timeout value as the one defined in Mixpanel config
						window.setTimeout(hrefCallback, mixpanel.get_config('track_links_timeout'));
						
						// fire the tracking event, if the event is done before the
						// timeout, the previous hrefCallback call is cancelled by
						// the call to document.location.href
						mixpanel.track("Downloaded Restlet Framework", {
							"Version":version.id,
							"Release":qualifier.name,
							"Edition":edition.middlename,
							"Distribution":distribution.fileType
						}, hrefCallback);
					});
		} else if (distribution.fileType == "p2") {
			$('#download_rf').click(
					function() {
						$('#eclipse_infos').css('display','none');
						$('#maven_infos').css('display','none');
						
						var hrefCallback = function() {
							$('#eclipse_infos').css('display','block');
							// open Kin Lane popup
							$("#deployModal").show();
						}
						
						// in case Mixpanel servers don't get back to us in time
						// we use the same timeout value as the one defined in Mixpanel config
						window.setTimeout(hrefCallback, mixpanel.get_config('track_links_timeout'));
						
						// fire the tracking event, if the event is done before the
						// timeout, the previous hrefCallback call is cancelled by
						// the call to document.location.href
						mixpanel.track("Downloaded Restlet Framework", {
							"Version":version.id,
							"Release":qualifier.name,
							"Edition":edition.middlename,
							"Distribution":"eclipse"
						}, hrefCallback);
					});			
		} else {
			$('#download_rf').click(
					function(event) {
						$('#eclipse_infos').css('display','none');
						$('#maven_infos').css('display','none');
						var hrefCallback = function() {
							// download selected resltet framework file
							event.preventDefault();  //stop the browser from following
							document.location.href = "/download/" + version.minorVersion + "/" + distribution.fileName;
							// open Kin Lane popup
							$("#deployModal").show();
						}
						
						// in case Mixpanel servers don't get back to us in time
						// we use the same timeout value as the one defined in Mixpanel config
						var trackTimeout = window.setTimeout(hrefCallback, mixpanel.get_config('track_links_timeout'));
						
						// fire the tracking event, if the event is done before the
						// timeout, we call a window.clearTimeout
						mixpanel.track("Downloaded Restlet Framework", {
							"Version":version.id,
							"Release":qualifier.name,
							"Edition":edition.middlename,
							"Distribution":distribution.fileType
						}, function() {
							window.clearTimeout(trackTimeout);
							hrefCallback();
						});
					});
		}
	}
}

function refresh() {
	// Look for the current distribution.
	distribution = getDistribution(distributionId);
	$("#" + cQualifiers.attr('id') + '-bt').empty();
	$("#" + cQualifiers.attr('id') + '-bt').append("<strong>" + qualifier.name + "</strong>");
	$("#" + cEditions.attr('id') + '-bt').empty();
	$("#" + cEditions.attr('id') + '-bt').append("<strong>" + edition.longname + "</strong>");
	$("#" + cTypesDistribution.attr('id') + '-bt').empty();
	
	if ("zip" == distributionId) {
		$("#" + cTypesDistribution.attr('id') + '-bt').append("<strong>ZIP file</strong>");
	} else if ("exe" == distributionId) {
		$("#" + cTypesDistribution.attr('id') + '-bt').append("<strong>Windows installer</strong>");
	} else if ("maven" == distributionId) {
		$("#" + cTypesDistribution.attr('id') + '-bt').append("<strong>Maven</strong>");
	} else if ("p2" == distributionId) {
		$("#" + cTypesDistribution.attr('id') + '-bt').append("<strong>Eclipse</strong>");
	}

	if (handleFragment) {
		window.location.hash = "#release=" + qualifier.id +"&edition=" + edition.id + "&distribution=" + distributionId;
	}

	setDownloadButton();
}

/**
 * Initializes the data model, cookies, and selectors.
 * @param sq
 * 		The selector of qualifiers.
 * @param se
 * 		The selector of editions.
 * @param std
 * 		The selector of type of distributions.
 * @param hf
 * 		True indicates that the uri will reflect the selectors's value in the uri fragment.
 * @param rd
 * 		True indicates if the click on the download button redirects to the download page.
 */
function init(sq, se, std, hf, rd) {
	cQualifiers = sq;
	cEditions = se;
	cTypesDistribution = std;
	if (hf) {
		handleFragment = true;
	} else {
		handleFragment = false;
	}
	if (rd) {
		redirectDownload = true;
	} else {
		redirectDownload = false;
	}

	loadQualifiers();
	loadEditions();
	loadDistributions();

	var hash = window.location.hash;
	var itemId = getParameterByName(hash, "release", $.cookie('release'));

	qualifier = getQualifier(itemId);
	if (!qualifier) {
		qualifier = getQualifier(getDefaultQualifier($.cookie('branch')));
	}
	$.cookie('release', qualifier.id, {path : '/'});

	version = getVersion(qualifier.version);

	itemId = getParameterByName(hash, "edition", $.cookie('edition'));
	edition = getEdition(itemId);
	if (!edition) {
		edition = getEdition(getDefaultEdition(version));
	}
	$.cookie('edition', edition.id, {path : '/'});
	
	itemId = getParameterByName(hash, "distribution", $.cookie('distribution'));
	distribution = getDistribution(itemId);
	if (!distribution) {
		distribution = getDistribution(getDefaultDistribution(version, edition));
	}
	if ("file" == distribution.type) {
		distributionId = distribution.fileType;
	} else {
		distributionId = distribution.type;
	}
	$.cookie('distribution', distributionId, {path : '/'});
	
	refresh();
}
