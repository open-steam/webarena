var request = require('superagent');
var expect = require('chai').expect;
var should = require('chai').should();

var net = require('net');
var JsonSocket = require('json-socket');
var port = 8125;
var host = '127.0.0.1';

describe('TcpServer', function () {
	it('tcp server should be running', function (done) {
		var client = net.connect(8125, function () {
			done();
		});
	});


	it('should return error if request type missing', function (done) {
		this.timeout(3000);
		var client = new JsonSocket(new net.Socket());
		client.connect(port, host);
		client.on("connect", function () {
			this.on('message', function (response) {
				expect(response).to.be.an("object");
				expect(response).to.have.property('error');
				done();
			});
			client.sendMessage("....");
			//setTimeout(done, 1);
		});
	});
});

describe('TCP subscribe events', function () {
	var client;
	beforeEach(function (done) {
		client = new JsonSocket(new net.Socket());
		client.connect(port, host);
		client.on("connect", function () {done();});
	});

	afterEach(function(){
		client.end();
	})

	it('should return error if eventlist is missing', function (done) {
		this.timeout(3000);

		client.on('message', function (response) {
			expect(response).to.be.an("object");
			expect(response).to.have.property('error');
			done();
		});

		var subscriptionEvent = {
			requestType: "subscribeEvents"
		};

		client.sendMessage(subscriptionEvent);
	});

	it('should return success for event subscription', function (done) {
		this.timeout(3000);

		client.on('message', function (response) {
			expect(response).to.be.an("object");
			expect(response).to.have.property('status');
			expect(response.status).to.be.eql("ok");
			done();
		});

		var subscriptionEvent = {
			requestType: "subscribeEvents",
			eventlist: "**"
		};

		client.sendMessage(subscriptionEvent);
	});

	it('should except event array', function(done){
		client.on('message', function(response){
			expect(response).to.be.an("object");
			expect(response).to.have.property('status');
			expect(response.status).to.be.eql("ok");
			done();
		});

		var subscriptionEvent = {
			requestType: "subscribeEvents",
			eventlist: ["**"]
		};

		client.sendMessage(subscriptionEvent);
	});
});