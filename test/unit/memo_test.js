
describe("Memo.constructor()", function() {
  it("throws error when type is invalid", function() {
    expect(() => new KinBase.Memo("test")).to.throw(/Invalid memo type/);
  });
});

describe("Memo.none()", function() {
  it("converts to/from xdr object", function() {
    let memo = KinBase.Memo.none().toXDRObject();
    expect(memo.value()).to.be.undefined;

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoNone);
    expect(baseMemo.value).to.be.null;
  });
});

describe("Memo.text()", function() {

  it("returns a value for a correct argument", function() {
    expect(() => KinBase.Memo.text("test")).to.not.throw();
    let memoUtf8 = KinBase.Memo.text("三代之時")

    let a = Buffer.from(memoUtf8.toXDRObject().value(), "utf8");
    let b = Buffer.from("三代之時", "utf8");
    expect(a).to.be.deep.equal(b);
  });

  it("returns a value for a correct argument (utf8)", function() {
    let memoText = KinBase.Memo.text([0xd1]).toXDRObject().toXDR();
    let expected = Buffer.from([
      // memo_text
      0x00, 0x00, 0x00, 0x01,
      // length
      0x00, 0x00, 0x00, 0x01,
      // value
      0xd1, 0x00, 0x00, 0x00
    ]);
    expect(memoText.equals(expected)).to.be.true;

    memoText = KinBase.Memo.text(Buffer.from([0xd1])).toXDRObject().toXDR();
    expect(memoText.equals(expected)).to.be.true;
  });

  it("converts to/from xdr object", function() {
    let memo = KinBase.Memo.text("test").toXDRObject();
    expect(memo.arm()).to.equal('text');
    expect(memo.text()).to.equal('test');
    expect(memo.value()).to.equal('test');

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoText);
    expect(baseMemo.value).to.be.equal('test');
  });

  it("converts to/from xdr object (array)", function() {
    let memo = KinBase.Memo.text([0xd1]).toXDRObject();
    expect(memo.arm()).to.equal('text');

    expect(memo.text()).to.be.deep.equal([0xd1]);
    expect(memo.value()).to.be.deep.equal([0xd1]);

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoText);
    expect(baseMemo.value).to.be.deep.equal([0xd1]);
  });

  it("converts to/from xdr object (buffer)", function() {
    let buf = Buffer.from([0xd1]);
    let memo = KinBase.Memo.text(buf).toXDRObject();
    expect(memo.arm()).to.equal('text');

    expect(memo.text().equals(buf)).to.be.true;
    expect(memo.value().equals(buf)).to.be.true;

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoText);
    expect(baseMemo.value.equals(buf)).to.be.true;
  });

  it("throws an error when invalid argument was passed", function() {
    expect(() => KinBase.Memo.text()).to.throw(/Expects string, array or buffer, max 28 bytes/);
    expect(() => KinBase.Memo.text({})).to.throw(/Expects string, array or buffer, max 28 bytes/);
    expect(() => KinBase.Memo.text(10)).to.throw(/Expects string, array or buffer, max 28 bytes/);
    expect(() => KinBase.Memo.text(Infinity)).to.throw(/Expects string, array or buffer, max 28 bytes/);
    expect(() => KinBase.Memo.text(NaN)).to.throw(/Expects string, array or buffer, max 28 bytes/);
  });

  it("throws an error when string is longer than 28 bytes", function() {
    expect(() => KinBase.Memo.text("12345678901234567890123456789")).to.throw(/Expects string, array or buffer, max 28 bytes/);
    expect(() => KinBase.Memo.text("三代之時三代之時三代之時")).to.throw(/Expects string, array or buffer, max 28 bytes/);
  });

});

describe("Memo.id()", function() {
  it("returns a value for a correct argument", function() {
    expect(() => KinBase.Memo.id("1000")).to.not.throw();
    expect(() => KinBase.Memo.id("0")).to.not.throw();
  });

  it("converts to/from xdr object", function() {
    let memo = KinBase.Memo.id("1000").toXDRObject();
    expect(memo.arm()).to.equal('id');
    expect(memo.id().toString()).to.equal('1000');

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoID);
    expect(baseMemo.value).to.be.equal('1000');
  });

  it("throws an error when invalid argument was passed", function() {
    expect(() => KinBase.Memo.id()).to.throw(/Expects a int64/);
    expect(() => KinBase.Memo.id({})).to.throw(/Expects a int64/);
    expect(() => KinBase.Memo.id(Infinity)).to.throw(/Expects a int64/);
    expect(() => KinBase.Memo.id(NaN)).to.throw(/Expects a int64/);
    expect(() => KinBase.Memo.id("test")).to.throw(/Expects a int64/);
  });
});

describe("Memo.hash() & Memo.return()", function() {
  it("hash converts to/from xdr object", function() {
    let buffer = Buffer.alloc(32, 10);

    let memo = KinBase.Memo.hash(buffer).toXDRObject();
    expect(memo.arm()).to.equal('hash');
    expect(memo.hash().length).to.equal(32);
    expect(memo.hash()).to.deep.equal(buffer);

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoHash);
    expect(baseMemo.value.length).to.equal(32);
    expect(baseMemo.value.toString('hex')).to.be.equal(buffer.toString('hex'));
  });

  it("return converts to/from xdr object", function() {
    let buffer = Buffer.alloc(32, 10);

    // Testing string hash
    let memo = KinBase.Memo.return(buffer.toString("hex")).toXDRObject();
    expect(memo.arm()).to.equal('retHash');
    expect(memo.retHash().length).to.equal(32);
    expect(memo.retHash().toString('hex')).to.equal(buffer.toString('hex'));

    let baseMemo = KinBase.Memo.fromXDRObject(memo);
    expect(baseMemo.type).to.be.equal(KinBase.MemoReturn);
    expect(Buffer.isBuffer(baseMemo.value)).to.be.true;
    expect(baseMemo.value.length).to.equal(32);
    expect(baseMemo.value.toString('hex')).to.be.equal(buffer.toString('hex'));
  });

  var methods = [KinBase.Memo.hash, KinBase.Memo.return];

  it("returns a value for a correct argument", function() {
    for (let i in methods) {
      let method = methods[i];
      expect(() => method(Buffer.alloc(32))).to.not.throw();
      expect(() => method('0000000000000000000000000000000000000000000000000000000000000000')).to.not.throw();
    }
  });

  it("throws an error when invalid argument was passed", function() {
    for (let i in methods) {
      let method = methods[i];
      expect(() => method()).to.throw(/Expects a 32 byte hash value/);
      expect(() => method({})).to.throw(/Expects a 32 byte hash value/);
      expect(() => method(Infinity)).to.throw(/Expects a 32 byte hash value/);
      expect(() => method(NaN)).to.throw(/Expects a 32 byte hash value/);
      expect(() => method("test")).to.throw(/Expects a 32 byte hash value/);
      expect(() => method([0, 10, 20])).to.throw(/Expects a 32 byte hash value/);
      expect(() => method(Buffer.alloc(33))).to.throw(/Expects a 32 byte hash value/);
      expect(() => method('00000000000000000000000000000000000000000000000000000000000000')).to.throw(/Expects a 32 byte hash value/);
      expect(() => method('000000000000000000000000000000000000000000000000000000000000000000')).to.throw(/Expects a 32 byte hash value/);
    }
  });
});
