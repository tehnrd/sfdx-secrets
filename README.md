sfdx-secrets
============

The `sfdx-secrets` plugin replaces merge variables within your project with values from environment variables on deploy.

With second generation managed packages, version control is the source of truth for defining and creating a package. This presents a challenge if you need to create a package that contains secrets, such as API keys, as these should never be committed to version control.

A common example is creating protected Custom Metadata components that store API keys for authenticating with external services. See the example below:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <label>Org</label>
  <protected>true</protected>
  <values>
    <field>Secret_API_Key__c</field>
    <value xsi:type="xsd:string">{{SECRET_API_KEY}}</value>
  </values>
</CustomMetadata>
```

Notice the `{{SECRET_API_KEY}}` text. This is the merge variable and it will be replaced with the environment variable `SECRET_API_KEY` when this file is deployed.

# Installation

```sh-session
$ sfdx plugins:install sfdx-secrets
```
# Usage
```sh-session
$ sfdx secrets:replace
```
