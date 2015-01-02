(function () {
  angular.module('handle', ['ui.bootstrap'])

  .controller('CodeforcesHandle', [ '$http', function ($http) {
    // User handle
    this.handle = '';
    
    this.userInfo     = null;
    this.status       = null;
    this.ratingChange = null;

    this.search = function () {
      var me = this; // closure

      if ( this.handle != '' ) {
        var url = null;

        // Retrieve user information from codeforce server
        url = 'http://codeforces.com/api/user.info?handles=' + this.handle + '&jsonp=JSON_CALLBACK';
        $http.jsonp(url).success(function (data) {
          me.userInfo = data.result[0];
        });

        // Retrieve user ratings from codeforces server
        url = 'http://codeforces.com/api/user.rating?handle=' + this.handle + '&jsonp=JSON_CALLBACK';
        $http.jsonp(url).success(function (data) {
          me.ratingChange = data.result;
          me.ratingChange.reverse();
        });

        // Retrieve user status from codeforces server
        url = 'http://codeforces.com/api/user.status?handle=' + this.handle + '&jsonp=JSON_CALLBACK';
        $http.jsonp(url).success(function (data) {
          var tmp = {};
          angular.forEach(data.result, function (sub, key) {
            var cid = sub.contestId;
            var pid = sub.problem.index;
            
            if (tmp[cid] == null) tmp[cid] = { contestId: cid, problems: {} };
            if (tmp[cid].problems[pid] == null) tmp[cid].problems[pid] = {subs: [], ok: false};

            if (sub.verdict == 'OK') tmp[cid].problems[pid].ok = true;

            tmp[cid].problems[pid].subs.push(sub);
          });

          me.status = [];
          angular.forEach(tmp, function (contest, id) {
            if (id < 100000) {
              var cc = {
                'contestId': id,
                problems: []
              };

              angular.forEach(contest.problems, function (problem, index) {
                var prob = {
                  problemId : index,
                  solved    : problem.ok ? 'btn-success' : 'btn-danger',
                  tooltip   : '<b>' + problem.subs[0].problem.name + '</b><br>'
                        +   problem.subs.map(function (sub) {
                            return '<span class="' +
                                  (sub.verdict == 'OK' ? 'good' : 'bad') +
                                  '">' +
                                  sub.id + '</span>';
                          }).join('<br>')
                };

                cc.problems.push(prob);
              });

              cc.problems.sort(function (a, b) {
                if (a.problemId < b.problemId) return -1;
                if (a.problemId > b.problemId) return 1;
                return 0;
              });

              me.status.push(cc);
            }
          });

          me.status.sort(function (a, b) {
            return b.contestId - a.contestId;
          });
        });
      }

      this.handle = '';
    };

    this.solved = function (subs) {
      if (subs) for (var i = 0; i < subs.length; i++) {
        if (subs[i].verdict && subs[i].verdict == 'OK')
          return 'btn-success';
      }
      return 'btn-danger';
    };

    this.getRank = function (change) {
      var rating = change.newRating;

      if (rating < 1200) return 'newbie';
      if (rating < 1350) return 'pupil';
      if (rating < 1500) return 'specialist';
      if (rating < 1700) return 'expert';
      if (rating < 1900) return 'candidate-master';
      if (rating < 2050) return 'master';
      if (rating < 2200) return 'international-master';
      if (rating < 2600) return 'grandmaster';
      return 'international-grandmaster';
    };

    this.ratingDir = function (change) {
      change.d = change.newRating - change.oldRating;

      change.changeTooltip = '<b class="' +
        (change.d < 0 ? 'bad' : 'good') +
        '">' +
        (change.d < 0 ? '-' : change.d > 0 ? '+' : '') + Math.abs(change.d) + '</b>';

      if (change.d > 0) {
        return 'glyphicon glyphicon-chevron-up up-direction';
      } else if (change.d < 0) {
        return 'glyphicon glyphicon-chevron-down down-direction';
      }
    };
  } ]);
})();