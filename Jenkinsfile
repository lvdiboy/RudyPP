// CI pipeline for RudyPP, running on the Jenkins server on AWS EC2.
// Builds with the Maven Wrapper (./mvnw), so the agent only needs JDK 25; no Maven installation is required.
// TODO: add the deploy details (target host, credentials, service restart) in the Deploy stage.
pipeline {
    agent any

    options {
        // Keep the last 10 builds and their artifacts
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    parameters {
        // Tests are skipped by default because the Jenkins server has no Redis yet.
        // TODO: set back to false once Redis is installed on the Jenkins server
        booleanParam(name: 'SKIP_TESTS', defaultValue: true,
                description: 'Skip the tests (they need a Redis server reachable at 127.0.0.1:6379)')
    }

    triggers {
        // Build automatically when develop has new commits: Jenkins checks GitHub every ~5 minutes
        // ("H" spreads the start time so jobs don't all poll at once).
        // Polling is used because Jenkins isn't reachable from the internet yet (SSH tunnel only),
        // so GitHub can't call a webhook. Once it is, switch to githubPush() for instant builds.
        // In a Multibranch Pipeline only develop polls; in a single-branch Pipeline job BRANCH_NAME is unset.
        pollSCM(env.BRANCH_NAME == null || env.BRANCH_NAME == 'develop' ? 'H/5 * * * *' : '')
    }

    environment {
        // The EC2 instance has 2 GiB RAM shared with Jenkins, so keep the Maven JVM small
        MAVEN_OPTS = '-Xms128m -Xmx512m'
        // Batch mode, no download progress noise in the console log
        MVN = './mvnw -B -ntp'
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
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
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

        stage('Upload to S3') {
    steps {
        sh '''
            aws s3 cp target/rudypp.jar \
              s3://YOUR-BUCKET-NAME/rudypp/builds/${BUILD_NUMBER}/rudypp.jar \
              --region us-west-2
        '''
    }
}

        stage('Deploy') {
            when {
                // Only deploy builds of the develop branch (requires a Multibranch Pipeline job)
                branch 'develop'
            }
            steps {
                // TODO: copy target/rudypp.jar to the app server and restart the service, e.g.
                //   sshagent(['ec2-deploy-key']) {
                //       sh 'scp target/rudypp.jar ec2-user@<APP_HOST>:/opt/rudypp/rudypp.jar'
                //       sh 'ssh ec2-user@<APP_HOST> sudo systemctl restart rudypp'
                //   }
                echo 'Deploy step not configured yet'
            }
        }
    }

    post {
        success {
            echo "Build ${env.BUILD_NUMBER} succeeded: target/rudypp.jar archived"
        }
        failure {
            echo "Build ${env.BUILD_NUMBER} failed, check the stage logs above"
        }
    }
}
