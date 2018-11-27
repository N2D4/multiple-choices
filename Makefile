CDBT = cd buildtools
PACKAGES = @babel/core@7.1 @babel/preset-env@7.1 @babel/cli@7.1 babel-loader@8.0 webpack@4.26 webpack-cli@3.1

WPARGS = --config=webpack.config.js
WPCONFIG = "module.exports = { module: { rules: [ { test: /\.js$$/, loader: 'babel-loader', options: { presets: [ ['@babel/preset-env' , { targets: '> 0.25%, not dead' } ] ] } } ] } };"

SRC_DIRS = $(shell find src -type d)
SRC_FILES = $(shell find src -type f -name '*')
PROD_FILES = $(patsubst src/%,out/prod/%,$(SRC_FILES))
DEV_FILES = $(patsubst src/%,out/dev/%,$(SRC_FILES))



.PHONY: prod dev bundle prod-bundle dev-bundle clean clean-all
prod: $(PROD_FILES)
dev: $(DEV_FILES)
bundle: prod-bundle
prod-bundle: out/prod-bundle.js
dev-bundle: out/dev-bundle.js
clean:
	rm -rf out
clean-all: clean
	rm -rf buildtools


out/prod/% out/dev/%: src/%
	@mkdir -p $(@D)
	cp $< $@

out/prod/js/bundle.js out/prod-bundle.js: $(SRC_FILES) $(SRC_DIRS) buildtools/package.json
	$(CDBT); npx webpack ../src/index.js -o ../$@ --mode=production $(WPARGS)

out/dev/js/bundle.js out/dev-bundle.js: $(SRC_FILES) $(SRC_DIRS) buildtools/package.json
	$(CDBT); npx webpack ../src/index.js -o ../$@ --mode=development $(WPARGS)

buildtools/package.json: | buildtools/webpack.config.js
	@mkdir -p $(@D)
	@echo
	@echo "************* Downloading Webpack and Babel *************"
	$(CDBT); npm init -y > /dev/null; npm install --save-dev $(PACKAGES)

buildtools/webpack.config.js:
	@mkdir -p $(@D)
	@echo $(WPCONFIG) > buildtools/webpack.config.js
