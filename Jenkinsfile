// CI pipeline for RudyPP, running on the Jenkins server on AWS EC2.
// Builds with the Maven Wrapper (./mvnw), so the agent only needs JDK 25; no Maven installation is required.
// Requires this Pipeline job SCM to be fixed to */develop. Submit deployment without waiting.
pipeline {
    agent any

    options {
        // Keep the last 10 builds and their artifacts
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        // Trigger a build on every push to the repository (requires GitHub plugin and webhook configured)
        githubPush()
    }

    environment {
        // The EC2 instance has 2 GiB RAM shared with Jenkins, so keep the Maven JVM small
        MAVEN_OPTS = '-Xms128m -Xmx512m'
        // Batch mode, no download progress noise in the console log
        MVN = './mvnw -B -ntp'
        AWS_DEFAULT_REGION = 'us-west-2'
        AWS_PAGER = ''
        S3_BUCKET = 'rudypp-cicd-artifacts-322473970370-us-west-2-an'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'chmod +x mvnw'
            }
        }

        stage('Build') {
            steps {
                sh "${MVN} clean compile"
            }
        }

        stage('Test') {
            steps {
                // Tests need no Redis or MySQL: in-memory H2 and an in-memory Redis fake (see src/test/resources/application.properties)
                sh "${MVN} test"
            }
            post {
                always {
                    junit testResults: 'target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Package') {
            steps {
                // Tests already ran in the Test stage
                sh "${MVN} package -DskipTests"
                archiveArtifacts artifacts: 'target/rudypp.jar', fingerprint: true
            }
        }

        stage('CodeDeploy ZIP') {
            steps {
                sh '''
                    set -eu
                    command -v aws >/dev/null
                    test -s target/rudypp.jar
                    test -s appspec.yml
                    for hook in before_install after_install stop start validate; do
                        test -s "deploy/${hook}.sh"
                    done
                    mkdir -p target/codedeploy/deploy
                    cp target/rudypp.jar target/codedeploy/rudypp.jar
                    cp appspec.yml target/codedeploy/appspec.yml
                    cp deploy/*.sh target/codedeploy/deploy/
                    sed -i 's/\\r$//' target/codedeploy/appspec.yml target/codedeploy/deploy/*.sh
                    for hook in target/codedeploy/deploy/*.sh; do bash -n "$hook"; done
                    chmod 755 target/codedeploy/deploy/*.sh
                    (cd target/codedeploy && zip -qr ../rudypp-codedeploy.zip appspec.yml rudypp.jar deploy)
                    unzip -t target/rudypp-codedeploy.zip
                    unzip -Z1 target/rudypp-codedeploy.zip
                '''
                archiveArtifacts artifacts: 'target/rudypp-codedeploy.zip', fingerprint: true
            }
        }

        stage('Upload to S3') {
            steps {
                script {
                    env.REVISION_KEY = sh(returnStdout: true, script: '''
                        set -eu
                        job_hash=$(printf '%s' "$JOB_NAME" | sha256sum | cut -c1-16)
                        printf 'rudypp/builds/%s/%s/%s/rudypp-codedeploy.zip' "$job_hash" "$BUILD_NUMBER" "$(git rev-parse HEAD)"
                    ''').trim()
                }
                sh '''
                    set -eu
                    aws s3 cp target/rudypp-codedeploy.zip "s3://${S3_BUCKET}/${REVISION_KEY}" --only-show-errors
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu
                    aws sts get-caller-identity
                    aws deploy get-deployment-group --application-name RudyPP --deployment-group-name RudyPP-Production --output json
                '''
                script {
                    env.DEPLOYMENT_ID = sh(returnStdout: true, script: '''
                        set -eu
                        aws deploy create-deployment --application-name RudyPP --deployment-group-name RudyPP-Production --s3-location "bucket=${S3_BUCKET},key=${REVISION_KEY},bundleType=zip" --description "Jenkins ${BUILD_TAG}" --query deploymentId --output text
                    ''').trim()
                    if (!(env.DEPLOYMENT_ID ==~ /d-[A-Za-z0-9]+/)) {
                        error('Invalid CodeDeploy deployment ID')
                    }
                    echo "CodeDeploy: ${env.DEPLOYMENT_ID}"
                }
            }
        }
    }
    post {
        success {
            echo "Build ${env.BUILD_NUMBER} succeeded: artifacts uploaded and CodeDeploy request accepted; track deployment result in AWS"
        }
        failure {
            echo "Build ${env.BUILD_NUMBER} failed, check the stage logs above"
        }
    }
}
